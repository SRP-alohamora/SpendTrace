import re
import json
import time
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from backend.agents.state import AnalyticsResponseContract
from backend.db.database import execute_safe_readonly_sql, get_db_connection

class AnalyticsQueryAgent:
    @staticmethod
    def answer_spending_query(question: str, user_id: Optional[str] = None) -> AnalyticsResponseContract:
        start_time = time.time()
        question_lower = question.lower()
        today = date.today()
        current_month = today.strftime("%Y-%m")
        # Calculate previous month
        first_of_month = today.replace(day=1)
        prev_month_date = first_of_month - timedelta(days=1)
        prev_month = prev_month_date.strftime("%Y-%m")

        user_tx_filter = f"AND user_id = '{user_id}'" if user_id else ""
        user_ret_filter = f"AND user_id = '{user_id}'" if user_id else ""

        # Scenario 1: Spending Increase / "Why did my spending increase / spike?"
        if any(term in question_lower for term in ["increase", "spike", "higher", "why did my spending", "rose"]):
            sql = f"""
                SELECT 
                    category,
                    SUM(CASE WHEN strftime('%Y-%m', date) = '{current_month}' THEN amount ELSE 0 END) as cur_spend,
                    SUM(CASE WHEN strftime('%Y-%m', date) = '{prev_month}' THEN amount ELSE 0 END) as prev_spend
                FROM transactions
                WHERE is_return = 0 AND status != 'deleted' {user_tx_filter}
                GROUP BY category
                ORDER BY (cur_spend - prev_spend) DESC
            """
            category_deltas = execute_safe_readonly_sql(sql)
            
            if not category_deltas:
                explanation = "You don't have any recorded transactions yet for this comparison. Upload a receipt photo or bank CSV to start tracking your expenses!"
                return AnalyticsResponseContract(
                    natural_language_explanation=explanation,
                    executed_sql=sql.strip(),
                    record_results=[],
                    cited_transaction_ids=[],
                    calculated_aggregates={"category_increase": 0.0},
                    execution_duration_ms=round((time.time() - start_time) * 1000, 2)
                )

            top_category = category_deltas[0]["category"]
            delta_amt = round(category_deltas[0]["cur_spend"] - category_deltas[0]["prev_spend"], 2)

            # Get supporting transactions for the top increasing category
            sql_tx = f"""
                SELECT id, date, merchant_clean, amount, category 
                FROM transactions 
                WHERE category = '{top_category}' 
                  AND strftime('%Y-%m', date) = '{current_month}'
                  AND is_return = 0 {user_tx_filter}
                ORDER BY amount DESC 
                LIMIT 3
            """
            records = execute_safe_readonly_sql(sql_tx)
            cited_ids = [r["id"] for r in records]

            tx_summary_lines = [f"• {r['merchant_clean']} on {r['date']} (${r['amount']:.2f})" for r in records]
            explanation = (
                f"Your spending increased in {datetime.strptime(current_month, '%Y-%m').strftime('%B')} primarily because "
                f"**{top_category}** spending grew by **${delta_amt:.2f}** compared to {datetime.strptime(prev_month, '%Y-%m').strftime('%B')}. "
                f"The top driving purchases were:\n" + ("\n".join(tx_summary_lines) if tx_summary_lines else "• (No individual receipts logged yet)")
            )

            dur_ms = round((time.time() - start_time) * 1000, 2)
            return AnalyticsResponseContract(
                natural_language_explanation=explanation,
                executed_sql=sql.strip(),
                record_results=records,
                cited_transaction_ids=cited_ids,
                calculated_aggregates={"category_increase": delta_amt},
                execution_duration_ms=dur_ms
            )

        # Scenario 2: Unmatched Returns / "Which returns have no matching refund?"
        elif any(term in question_lower for term in ["refund", "return", "unmatched", "no refund", "uncredited"]):
            sql = f"""
                SELECT id, merchant_name, expected_amount, status, return_date, deadline_date
                FROM return_reconciliations
                WHERE status IN ('overdue_alert', 'awaiting_credit') {user_ret_filter}
                ORDER BY return_date ASC
            """
            records = execute_safe_readonly_sql(sql)
            cited_ids = [r["id"] for r in records]

            if not records:
                explanation = "All your logged returns have been successfully reconciled with bank credits! There are currently no missing refunds."
            else:
                lines = []
                for r in records:
                    status_label = "🔴 OVERDUE" if r["status"] == "overdue_alert" else "⏳ Awaiting Credit"
                    lines.append(f"• **{r['merchant_name']}**: ${r['expected_amount']:.2f} returned on {r['return_date']} ({status_label})")
                explanation = (
                    f"You have **{len(records)}** active return(s) awaiting credit:\n" +
                    "\n".join(lines) + 
                    "\n\n*Items marked Overdue have passed the 10-day settlement window. You should contact the merchant or dispute with your bank.*"
                )

            dur_ms = round((time.time() - start_time) * 1000, 2)
            return AnalyticsResponseContract(
                natural_language_explanation=explanation,
                executed_sql=sql.strip(),
                record_results=records,
                cited_transaction_ids=cited_ids,
                calculated_aggregates={"uncollected_refunds_count": len(records)},
                execution_duration_ms=dur_ms
            )

        # Scenario 3: Category or Total Spending (e.g. "How much did I spend on groceries / coffee / dining?")
        else:
            cat_filter = ""
            for cat in ["groceries", "dining", "shopping", "transportation", "home"]:
                if cat in question_lower:
                    cat_filter = f"AND LOWER(category) = '{cat}'"
                    break

            sql = f"""
                SELECT id, date, merchant_clean, amount, category
                FROM transactions
                WHERE is_return = 0 AND status != 'deleted' {cat_filter} {user_tx_filter}
                ORDER BY date DESC
                LIMIT 10
            """
            records = execute_safe_readonly_sql(sql)
            cited_ids = [r["id"] for r in records]

            total_sql = f"SELECT SUM(amount) as total FROM transactions WHERE is_return = 0 AND status != 'deleted' {cat_filter} {user_tx_filter}"
            total_rows = execute_safe_readonly_sql(total_sql)
            total_sum = total_rows[0]["total"] if total_rows and total_rows[0]["total"] is not None else 0.0

            if not records and total_sum == 0.0:
                explanation = "You have 0 transactions recorded yet. Your ledger is clean! Upload a receipt or drag & drop a bank CSV to itemize your spending."
            else:
                explanation = (
                    f"You have a total of **${total_sum:.2f}** recorded across these transactions. "
                    f"Here are your most recent entries:\n" +
                    "\n".join([f"• {r['date']} - {r['merchant_clean']}: **${r['amount']:.2f}** ({r['category']})" for r in records[:5]])
                )

            dur_ms = round((time.time() - start_time) * 1000, 2)
            return AnalyticsResponseContract(
                natural_language_explanation=explanation,
                executed_sql=sql.strip(),
                record_results=records,
                cited_transaction_ids=cited_ids,
                calculated_aggregates={"total_spend": round(total_sum, 2)},
                execution_duration_ms=dur_ms
            )
