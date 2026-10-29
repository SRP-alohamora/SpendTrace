import re
from typing import Dict, Any, List, Optional, Tuple

# =====================================================================
# Intelligent Retailer Taxonomy & Categorization Rules
# Built for Mint.com & Credit Karma competitive capabilities:
# - Intelligent Non-Itemized Retailer Mapping (Marshalls -> Apparel, Walmart -> Groceries)
# - Credit Card Payment & Debt Tracking (Chase Payment, Amex Autopay)
# - Uncategorized Bill Detection (Electric, Water, Internet, Telecom)
# =====================================================================

RETAILER_TAXONOMY: List[Dict[str, Any]] = [
    # -------------------------------------------------------------
    # 1. Apparel, Fashion & Department Stores
    # Marshalls requirement: "receipt from Marshalls goes into apparel"
    # -------------------------------------------------------------
    {
        "category": "Apparel",
        "subcategory": "Clothing & Accessories",
        "patterns": [
            r"\bmarshalls?\b", r"\bt\.?j\.?\s*maxx\b", r"\bross\s*(dress\s*for\s*less)?\b",
            r"\bnordstrom(\s*rack)?\b", r"\bzara\b", r"\bh\s*&\s*m\b", r"\bgap\b",
            r"\bold\s*navy\b", r"\bmacy'?s\b", r"\blululemon\b", r"\bnike\b",
            r"\badidas\b", r"\buniqlo\b", r"\bbanana\s*republic\b", r"\banthropologie\b",
            r"\burban\s*outfitters\b", r"\bforever\s*21\b", r"\bfoot\s*locker\b",
            r"\bdsw\b", r"\bsheers\b", r"\basos\b", r"\bsephora\b", r"\bulta\b"
        ],
        "default_reason": "Recognized apparel, fashion & accessories retailer."
    },

    # -------------------------------------------------------------
    # 2. Groceries & Supermarkets
    # Walmart requirement: "receipt from Walmart goes into grocery if not itemized"
    # -------------------------------------------------------------
    {
        "category": "Groceries",
        "subcategory": "Supermarkets & Groceries",
        "patterns": [
            r"\bwalmart\b", r"\btrader\s*joe'?s?\b", r"\bsafeway\b", r"\bwhole\s*foods\b",
            r"\bkroger\b", r"\baldi\b", r"\bcostco(\s*wholesale)?\b", r"\bsam'?s\s*club\b",
            r"\bh\s*mart\b", r"\bwegmans\b", r"\bpublix\b", r"\bheb\b", r"\bsprouts\b",
            r"\bfood\s*lion\b", r"\bstop\s*&\s*shop\b", r"\bgiant\s*(food)?\b",
            r"\b99\s*ranch\b", r"\bwinco\b", r"\bmarket\s*basket\b", r"\blidl\b"
        ],
        "default_reason": "Supermarket/grocery merchant (default for non-itemized transactions)."
    },

    # -------------------------------------------------------------
    # 3. Credit Card Payments (Mint / Credit Karma tracking)
    # Competing on tracking all credit card payments across cards
    # -------------------------------------------------------------
    {
        "category": "Credit Card Payment",
        "subcategory": "Card Autopay / Debt Transfer",
        "is_credit_card_payment": True,
        "patterns": [
            r"\bchase\s*(credit\s*card|card|autopay|epay|payment)\b",
            r"\bamex\s*(epay|payment|autopay|card)\b",
            r"\bamerican\s*express\s*(payment|autopay|card)\b",
            r"\bciti(bank)?\s*(card|payment|autopay|epay)\b",
            r"\bcapital\s*one\s*(crcard|payment|autopay)\b",
            r"\bbofa\s*(credit\s*card|payment|autopay)\b",
            r"\bbank\s*of\s*america\s*(credit\s*card|payment)\b",
            r"\bdiscover\s*(card|payment|autopay|e-payment)\b",
            r"\bapple\s*card\s*(payment|monthly)\b",
            r"\bwells\s*fargo\s*(card\s*pmt|payment)\b",
            r"\bcredit\s*card\s*(pmt|payment|autopay)\b"
        ],
        "default_reason": "Credit card payment / balance payoff detected (avoids double counting in spend totals)."
    },

    # -------------------------------------------------------------
    # 4. Recurring Bills & Utilities
    # List of bills requirement (electric, gas, water, internet)
    # -------------------------------------------------------------
    {
        "category": "Bills & Utilities",
        "subcategory": "Electric, Water & Telecom",
        "is_bill": True,
        "patterns": [
            r"\bpg\s*&\s*e\b", r"\bpacific\s*gas\b", r"\bcon\s*ed(ison)?\b",
            r"\bduke\s*energy\b", r"\bnational\s*grid\b", r"\beversource\b",
            r"\bsocal\s*edison\b", r"\bfpl\b", r"\bflorida\s*power\b",
            r"\bwater\s*(dept|district|utility|bill)\b", r"\bwaste\s*management\b",
            r"\brepublic\s*services\b", r"\bat\s*&\s*t\b", r"\bverizon(\s*wireless)?\b",
            r"\bt-?mobile\b", r"\bcomcast\b", r"\bxfinity\b", r"\bspectrum\b",
            r"\bcharter\b", r"\bgoogle\s*fiber\b", r"\bcentury\s*link\b",
            r"\belectric\s*bill\b", r"\butility\b"
        ],
        "default_reason": "Monthly household utility / telecommunications bill."
    },

    # -------------------------------------------------------------
    # 5. Dining & Fast Casual
    # -------------------------------------------------------------
    {
        "category": "Dining",
        "subcategory": "Restaurants & Cafes",
        "patterns": [
            r"\bstarbucks\b", r"\bpeet'?s\s*coffee\b", r"\bblue\s*bottle(\s*coffee)?\b",
            r"\bdunkin'?\b", r"\bchipotle\b", r"\bsweetgreen\b", r"\bmcdonald'?s\b",
            r"\bin-n-out\b", r"\bwendy'?s\b", r"\btaco\s*bell\b", r"\bchick-fil-a\b",
            r"\bpanera(\s*bread)?\b", r"\bshake\s*shack\b", r"\bnobu\b",
            r"\bolive\s*garden\b", r"\bosteria\b", r"\bdoordash\b", r"\buber\s*eats\b", r"\bgrubhub\b",
            r"\bcaviar\b", r"\brestaurant\b", r"\bcafe\b", r"\bbakery\b", r"\bpizzeria\b"
        ],
        "default_reason": "Dining, coffee shop, or meal delivery establishment."
    },

    # -------------------------------------------------------------
    # 6. Home Improvement & Hardware
    # -------------------------------------------------------------
    {
        "category": "Home Improvement",
        "subcategory": "Tools, Hardware & Furniture",
        "patterns": [
            r"\bhome\s*depot\b", r"\blowe'?s\b", r"\bace\s*hardware\b",
            r"\bikea\b", r"\bwayfair\b", r"\bcrate\s*&\s*barrel\b",
            r"\bpottery\s*barn\b", r"\bmenards\b", r"\bwest\s*elm\b"
        ],
        "default_reason": "Home improvement, hardware, or furnishings retailer."
    },

    # -------------------------------------------------------------
    # 7. Electronics & Technology
    # -------------------------------------------------------------
    {
        "category": "Electronics",
        "subcategory": "Gadgets & Computing",
        "patterns": [
            r"\bbest\s*buy\b", r"\bapple\s*store\b", r"\bmicro\s*center\b",
            r"\bnewegg\b", r"\bb\s*&\s*h\s*photo\b", r"\bdell\b", r"\blenovo\b"
        ],
        "default_reason": "Consumer electronics, computers & tech accessories."
    },

    # -------------------------------------------------------------
    # 8. Healthcare, Wellness & Pharmacy
    # -------------------------------------------------------------
    {
        "category": "Healthcare & Pharmacy",
        "subcategory": "Medical & Pharmacy",
        "patterns": [
            r"\bcvs(\s*pharmacy)?\b", r"\bwalgreens\b", r"\brite\s*aid\b",
            r"\bduane\s*reade\b", r"\bquest\s*diagnostics\b", r"\blabcorp\b",
            r"\bkaiser(\s*permanente)?\b", r"\boptum\b", r"\bpharmacy\b", r"\bclinic\b"
        ],
        "default_reason": "Healthcare provider, clinical lab, or retail pharmacy."
    },

    # -------------------------------------------------------------
    # 9. Gas & Fuel
    # -------------------------------------------------------------
    {
        "category": "Gas & Fuel",
        "subcategory": "Automotive Fuel",
        "patterns": [
            r"\bshell\s*(oil|gas)?\b", r"\bchevron\b", r"\bexxon(mobil)?\b",
            r"\bmobil\b", r"\bbp\s*(gas|oil)?\b", r"\bspeedway\b",
            r"\bphillips\s*66\b", r"\bsunoco\b", r"\b7-eleven\s*gas\b",
            r"\barco\b", r"\bvalero\b", r"\bgas\s*station\b"
        ],
        "default_reason": "Service station / vehicle fuel purchase."
    },

    # -------------------------------------------------------------
    # 10. Transit & Rideshare
    # -------------------------------------------------------------
    {
        "category": "Transit & Rideshare",
        "subcategory": "Public Transit & Taxis",
        "patterns": [
            r"\buber(\s*trip)?\b", r"\blyft(\s*ride)?\b", r"\bmta\b", r"\bbart\b",
            r"\bclipper\b", r"\bcaltrain\b", r"\bamtrak\b", r"\bnj\s*transit\b",
            r"\bwmata\b", r"\bmetro\b", r"\btaxi\b"
        ],
        "default_reason": "Rideshare, regional rail, or public transit fare."
    },

    # -------------------------------------------------------------
    # 11. Subscriptions & Entertainment
    # -------------------------------------------------------------
    {
        "category": "Subscriptions & Entertainment",
        "subcategory": "Streaming & Digital Media",
        "patterns": [
            r"\bnetflix\b", r"\bspotify\b", r"\bhulu\b", r"\bdisney\+?\b",
            r"\bhbo\s*max\b", r"\bmax\.com\b", r"\bapple\.com/bill\b",
            r"\byoutube\s*premium\b", r"\bamazon\s*prime\b", r"\bnytimes\b",
            r"\bparamount\+?\b", r"\bpeacock\b"
        ],
        "default_reason": "Recurring digital subscription or streaming service."
    },

    # -------------------------------------------------------------
    # 12. General Shopping & E-Commerce
    # -------------------------------------------------------------
    {
        "category": "Shopping",
        "subcategory": "General Merchandise",
        "patterns": [
            r"\btarget(\s*store)?\b", r"\bamazon(\.com)?\b", r"\bamzn\b",
            r"\betsy\b", r"\bebay\b", r"\bwish\b", r"\baliexpress\b"
        ],
        "default_reason": "General e-commerce or department merchandise retailer."
    },

    # -------------------------------------------------------------
    # 13. Travel & Lodging
    # -------------------------------------------------------------
    {
        "category": "Travel",
        "subcategory": "Airlines & Hotels",
        "patterns": [
            r"\bunited\s*airlines\b", r"\bdelta(\s*air)?\b", r"\bamerican\s*airlines\b",
            r"\bsouthwest(\s*air)?\b", r"\bmarriott\b", r"\bhilton\b",
            r"\bhyatt\b", r"\bairbnb\b", r"\bexpedia\b", r"\bbooking\.com\b"
        ],
        "default_reason": "Commercial airline flight, lodging, or travel booking."
    },

    # -------------------------------------------------------------
    # 14. Insurance
    # -------------------------------------------------------------
    {
        "category": "Insurance",
        "subcategory": "Auto & Home Insurance",
        "is_bill": True,
        "patterns": [
            r"\bgeico\b", r"\bstate\s*farm\b", r"\bprogressive\b",
            r"\ballstate\b", r"\bliberty\s*mutual\b", r"\blemonade\b"
        ],
        "default_reason": "Monthly or semi-annual insurance policy payment."
    }
]

class CategorizationIntelligence:
    """
    Intelligent Retailer & Expense Categorization Engine.
    Exceeds Mint.com / Credit Karma legacy capabilities:
    - Specializes in non-itemized retailer inferences (Marshalls -> Apparel, Walmart -> Groceries)
    - Distinguishes credit card payment transfers from discretionary spending
    - Automatically classifies uncategorized bills from spreadsheets & bank ledgers
    - Supports line-item breakdown overrides when receipts are itemized
    """

    @classmethod
    def clean_merchant_string(cls, raw: str) -> str:
        """Strips bank clearing codes, terminal IDs, and transaction prefixes."""
        if not raw:
            return "Unknown Merchant"
        
        cleaned = raw.strip()
        # Remove common bank prefixes
        cleaned = re.sub(r"^(SQ \*|TST\*|PY \*|SP \*|CHECKCARD|POS DEBIT|ACH WITHDRAWAL -?|PURCHASE AUTHORIZED ON \d+/\d+ )\s*", "", cleaned, flags=re.IGNORECASE)
        # Remove card terminal or store numbers like #102, STORE 4412, T-112
        cleaned = re.sub(r"(#\d+|STORE\s*#?\d+|T-\d+|\d{4,})\b", "", cleaned, flags=re.IGNORECASE)
        # Remove location suffixes like 'SAN FRANCISCO CA', 'PALO ALTO CA', 'US'
        cleaned = re.sub(r"\b(SAN FRAN(CISCO)?|PALO ALTO|NEW YORK|LOS ANGELES|SEATTLE|CHICAGO|CA|NY|TX|WA|IL|US)\b", "", cleaned, flags=re.IGNORECASE)
        # Clean extra whitespace and punctuation
        cleaned = re.sub(r"[*_\-#]", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned or raw.strip()

    @classmethod
    def infer_category(
        cls,
        merchant_name: str,
        is_itemized: bool = False,
        line_items: Optional[List[Dict[str, Any]]] = None,
        amount: Optional[float] = None,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Determines the optimal financial category with explainable rationale.
        If the receipt is itemized and item details specify a category, line items inform the choice.
        If non-itemized, performs deep retailer taxonomy intelligence.
        """
        raw_text = f"{merchant_name} {notes or ''}".lower()
        cleaned_merchant = cls.clean_merchant_string(merchant_name)

        # 1. Specific User Requirement: Non-itemized Walmart goes into Groceries
        if re.search(r"\bwalmart\b", raw_text, re.IGNORECASE):
            if not is_itemized:
                return {
                    "category": "Groceries",
                    "subcategory": "Supermarkets & Groceries",
                    "confidence": 0.96,
                    "reasoning": "Receipt from Walmart is non-itemized; intelligent retailer inference categorized into Groceries.",
                    "is_credit_card_payment": False,
                    "is_bill": False,
                    "rule_type": "retailer_taxonomy_non_itemized"
                }
            elif line_items and len(line_items) > 0:
                # If itemized, check if majority items are electronics, clothing, or general
                first_hint = None
                first_name = "item"
                first_item = line_items[0]
                if isinstance(first_item, dict):
                    first_hint = first_item.get("category_hint")
                    first_name = first_item.get("name", "item")
                elif isinstance(first_item, str):
                    first_name = first_item
                    item_str = first_item.lower()
                    if any(k in item_str for k in ["ipad", "tv", "laptop", "headphone", "electronic", "computer", "phone"]):
                        first_hint = "Electronics"
                    elif any(k in item_str for k in ["shirt", "pant", "shoe", "dress", "jacket", "apparel", "hoodie"]):
                        first_hint = "Apparel"
                    else:
                        first_hint = "Groceries"

                if first_hint and first_hint != "General":
                    return {
                        "category": first_hint,
                        "subcategory": f"Itemized Walmart {first_hint}",
                        "confidence": 0.94,
                        "reasoning": f"Itemized Walmart receipt classified from primary line item '{first_name}' as {first_hint}.",
                        "is_credit_card_payment": False,
                        "is_bill": False,
                        "rule_type": "itemized_line_item_override"
                    }
                return {
                    "category": "Groceries",
                    "subcategory": "Supermarkets & Groceries",
                    "confidence": 0.95,
                    "reasoning": "Walmart receipt with grocery items categorized as Groceries.",
                    "is_credit_card_payment": False,
                    "is_bill": False,
                    "rule_type": "itemized_grocery_majority"
                }

        # 2. Specific User Requirement: Marshalls goes into Apparel
        if re.search(r"\bmarshalls?\b", raw_text, re.IGNORECASE):
            return {
                "category": "Apparel",
                "subcategory": "Clothing & Accessories",
                "confidence": 0.98,
                "reasoning": "Receipt from Marshalls is recognized as apparel, footwear & fashion accessories; categorized as Apparel.",
                "is_credit_card_payment": False,
                "is_bill": False,
                "rule_type": "retailer_taxonomy_marshalls_apparel"
            }

        # 3. Itemized Receipt Analysis (if line items are supplied with category hints)
        if is_itemized and line_items:
            category_counts: Dict[str, float] = {}
            for item in line_items:
                cat = item.get("category_hint") or "General"
                if cat != "General":
                    price = float(item.get("total_price", 1.0))
                    category_counts[cat] = category_counts.get(cat, 0.0) + price
            
            if category_counts:
                # Pick highest spend category among line items
                dominant_cat = max(category_counts.items(), key=lambda kv: kv[1])[0]
                return {
                    "category": dominant_cat,
                    "subcategory": "Itemized Basket Majority",
                    "confidence": 0.93,
                    "reasoning": f"Itemized line items dominant spend mapped to {dominant_cat}.",
                    "is_credit_card_payment": False,
                    "is_bill": False,
                    "rule_type": "itemized_majority_spend"
                }

        # 4. Match against Retailer & Merchant Taxonomy
        for entry in RETAILER_TAXONOMY:
            for pat in entry["patterns"]:
                if re.search(pat, raw_text, re.IGNORECASE) or re.search(pat, cleaned_merchant, re.IGNORECASE):
                    return {
                        "category": entry["category"],
                        "subcategory": entry.get("subcategory", entry["category"]),
                        "confidence": 0.95,
                        "reasoning": f"Retailer '{cleaned_merchant}' matched intelligent taxonomy rule: {entry.get('default_reason')}",
                        "is_credit_card_payment": entry.get("is_credit_card_payment", False),
                        "is_bill": entry.get("is_bill", False),
                        "rule_type": "retailer_taxonomy_match"
                    }

        # 5. Contextual Heuristics for Uncategorized Bank & Bill Ledgers
        # (Keywords in bill descriptions or payee strings)
        if any(term in raw_text for term in ["payment", "epay", "autopay", "transfer to card", "cc pmt"]):
            return {
                "category": "Credit Card Payment",
                "subcategory": "Card Autopay / Debt Transfer",
                "confidence": 0.88,
                "reasoning": "Detected credit card payment/transfer keyword in transaction description.",
                "is_credit_card_payment": True,
                "is_bill": False,
                "rule_type": "keyword_transfer_heuristic"
            }
        
        if any(term in raw_text for term in ["water", "sewer", "electric", "power", "energy", "trash", "broadband", "telecom", "utility"]):
            return {
                "category": "Bills & Utilities",
                "subcategory": "Household Utilities",
                "confidence": 0.90,
                "reasoning": "Detected recurring utility keyword in bill description.",
                "is_credit_card_payment": False,
                "is_bill": True,
                "rule_type": "keyword_utility_heuristic"
            }

        if any(term in raw_text for term in ["coffee", "diner", "pizza", "burger", "grill", "bistro", "tacos", "sushi", "kitchen", "bakery"]):
            return {
                "category": "Dining",
                "subcategory": "Food & Beverage",
                "confidence": 0.85,
                "reasoning": "Detected culinary keyword in merchant name.",
                "is_credit_card_payment": False,
                "is_bill": False,
                "rule_type": "keyword_dining_heuristic"
            }

        # Default fallback if unknown
        return {
            "category": "Other",
            "subcategory": "Uncategorized Expense",
            "confidence": 0.50,
            "reasoning": f"No retailer pattern matched for '{cleaned_merchant}'; placed in Other for manual verification.",
            "is_credit_card_payment": False,
            "is_bill": False,
            "rule_type": "fallback_other"
        }
