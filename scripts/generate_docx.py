#!/usr/bin/env python3
"""
SpendTrace submission.docx Generator
Parses SUBMISSION.md and constructs a pristine, fully-compliant Microsoft Word (.docx) 
OpenXML document package without requiring external dependencies.
"""

import os
import re
import zipfile
import html
from typing import List, Tuple

def escape_xml(text: str) -> str:
    """Escapes XML entities while preserving readable characters."""
    return html.escape(text, quote=True).replace("'", "&apos;")

def create_run(text: str, bold: bool = False, italic: bool = False, color: str = None, size_pt: float = None, font: str = "Calibri") -> str:
    rPr = []
    if bold:
        rPr.append("<w:b/>")
    if italic:
        rPr.append("<w:i/>")
    if color:
        rPr.append(f'<w:color w:val="{color}"/>')
    if size_pt:
        half_pts = int(size_pt * 2)
        rPr.append(f'<w:sz w:val="{half_pts}"/>')
        rPr.append(f'<w:szCs w:val="{half_pts}"/>')
    if font:
        rPr.append(f'<w:rFonts w:ascii="{font}" w:hAnsi="{font}" w:cs="{font}"/>')
    
    rPr_xml = f"<w:rPr>{''.join(rPr)}</w:rPr>" if rPr else ""
    return f'<w:r>{rPr_xml}<w:t xml:space="preserve">{escape_xml(text)}</w:t></w:r>'

def parse_markdown_line_to_runs(line: str, default_size: float = 11.0, default_color: str = "202124") -> str:
    """Parses inline bold, italic, code, and links into OpenXML runs."""
    runs = []
    # Tokenize by markdown inline formatting: **bold**, *italic*, `code`, [text](url)
    pattern = re.compile(r'(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`|\[[^\]]+?\]\([^)]+?\))')
    tokens = pattern.split(line)
    for token in tokens:
        if not token:
            continue
        if token.startswith("**") and token.endswith("**") and len(token) >= 4:
            bold_text = token[2:-2]
            runs.append(create_run(bold_text, bold=True, size_pt=default_size, color=default_color))
        elif token.startswith("*") and token.endswith("*") and len(token) >= 2:
            italic_text = token[1:-1]
            runs.append(create_run(italic_text, italic=True, size_pt=default_size, color=default_color))
        elif token.startswith("`") and token.endswith("`") and len(token) >= 2:
            code_text = token[1:-1]
            runs.append(create_run(code_text, font="Consolas", color="1a73e8", size_pt=default_size * 0.95))
        elif token.startswith("[") and "](" in token and token.endswith(")"):
            m = re.match(r'\[([^\]]+)\]\(([^)]+)\)', token)
            if m:
                link_text = m.group(1)
                runs.append(create_run(link_text, color="1a73e8", bold=True, size_pt=default_size))
            else:
                runs.append(create_run(token, size_pt=default_size, color=default_color))
        else:
            runs.append(create_run(token, size_pt=default_size, color=default_color))
    return "".join(runs)

def create_paragraph(runs_xml: str, style: str = None, space_before: int = 0, space_after: int = 120, line_spacing: int = 240, align: str = None, bullet: bool = False) -> str:
    pPr = []
    if style:
        pPr.append(f'<w:pStyle w:val="{style}"/>')
    if align:
        pPr.append(f'<w:jc w:val="{align}"/>')
    
    spacing_attrs = []
    if space_before:
        spacing_attrs.append(f'w:before="{space_before}"')
    if space_after:
        spacing_attrs.append(f'w:after="{space_after}"')
    if line_spacing:
        spacing_attrs.append(f'w:line="{line_spacing}" w:lineRule="auto"')
    if spacing_attrs:
        pPr.append(f"<w:spacing {' '.join(spacing_attrs)}/>")
        
    if bullet:
        pPr.append('<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>')
        
    pPr_xml = f"<w:pPr>{''.join(pPr)}</w:pPr>" if pPr else ""
    return f"<w:p>{pPr_xml}{runs_xml}</w:p>"

def create_table(rows: List[List[str]], is_header_row: bool = True) -> str:
    """Generates an OpenXML table with clean borders and styled headers."""
    tbl_xml = ['<w:tbl>']
    # Table properties
    tbl_xml.append("""
      <w:tblPr>
        <w:tblStyle w:val="TableGrid"/>
        <w:tblW w:w="9400" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="DADCE0"/>
          <w:left w:val="single" w:sz="6" w:space="0" w:color="DADCE0"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="DADCE0"/>
          <w:right w:val="single" w:sz="6" w:space="0" w:color="DADCE0"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E8EAED"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E8EAED"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="120" w:type="dxa"/>
          <w:bottom w:w="120" w:type="dxa"/>
          <w:left w:w="160" w:type="dxa"/>
          <w:right w:w="160" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
    """)
    
    num_cols = max(len(r) for r in rows) if rows else 1
    col_width = int(9400 / num_cols)
    
    for r_idx, row in enumerate(rows):
        is_hdr = (r_idx == 0 and is_header_row)
        tbl_xml.append('<w:tr>')
        if is_hdr:
            tbl_xml.append('<w:trPr><w:tblHeader/></w:trPr>')
            
        for c_idx, cell_text in enumerate(row):
            # Parse <br> into separate paragraphs
            sub_lines = cell_text.split("<br>")
            cell_paragraphs = []
            for sl in sub_lines:
                sl_clean = sl.strip()
                bg_color = 'F8F9FA' if is_hdr else 'FFFFFF'
                if is_hdr:
                    runs = parse_markdown_line_to_runs(sl_clean, default_size=10.0, default_color="1A73E8")
                    cell_paragraphs.append(create_paragraph(runs, space_before=40, space_after=40, align="center" if c_idx == 0 else "left"))
                else:
                    runs = parse_markdown_line_to_runs(sl_clean, default_size=9.5, default_color="202124")
                    cell_paragraphs.append(create_paragraph(runs, space_before=30, space_after=30, align="center" if c_idx == 0 else "left"))
            
            tc_shd = f'<w:shd w:val="clear" w:color="auto" w:fill="{bg_color}"/>'
            tc_pr = f'<w:tcPr><w:tcW w:w="{col_width}" w:type="dxa"/>{tc_shd}</w:tcPr>'
            tbl_xml.append(f'<w:tc>{tc_pr}{"".join(cell_paragraphs)}</w:tc>')
            
        tbl_xml.append('</w:tr>')
        
    tbl_xml.append('</w:tbl>')
    return "".join(tbl_xml)

def convert_markdown_to_docx_body(md_content: str) -> str:
    body_elements = []
    lines = md_content.splitlines()
    i = 0
    in_code_block = False
    code_block_lines = []
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Code block handling
        if stripped.startswith("```"):
            if in_code_block:
                # End code block
                in_code_block = False
                for c_line in code_block_lines:
                    runs = create_run(c_line, font="Consolas", size_pt=9.0, color="202124")
                    body_elements.append(create_paragraph(runs, space_before=10, space_after=10, line_spacing=200))
                code_block_lines = []
            else:
                in_code_block = True
                code_block_lines = []
            i += 1
            continue
            
        if in_code_block:
            code_block_lines.append(line)
            i += 1
            continue
            
        # Table handling
        if stripped.startswith("|") and stripped.endswith("|"):
            table_rows = []
            while i < len(lines) and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                row_raw = lines[i].strip()
                # Check if it's separator row | :-: | :--- |
                if re.match(r'^\|[\s:-|]+\|$', row_raw):
                    i += 1
                    continue
                cells = [c.strip() for c in row_raw.strip('|').split('|')]
                table_rows.append(cells)
                i += 1
            if table_rows:
                body_elements.append(create_table(table_rows, is_header_row=True))
                body_elements.append(create_paragraph("", space_before=0, space_after=100))
            continue
            
        if not stripped:
            i += 1
            continue
            
        # Headings
        if stripped.startswith("# "):
            h_text = stripped[2:].strip()
            runs = create_run(h_text, bold=True, size_pt=20.0, color="1a73e8", font="Arial")
            body_elements.append(create_paragraph(runs, space_before=240, space_after=120))
        elif stripped.startswith("## "):
            h_text = stripped[3:].strip()
            runs = create_run(h_text, bold=True, size_pt=16.0, color="202124", font="Arial")
            body_elements.append(create_paragraph(runs, space_before=200, space_after=100))
        elif stripped.startswith("### "):
            h_text = stripped[4:].strip()
            runs = create_run(h_text, bold=True, size_pt=13.0, color="1a73e8", font="Arial")
            body_elements.append(create_paragraph(runs, space_before=160, space_after=80))
        elif stripped.startswith("#### "):
            h_text = stripped[5:].strip()
            runs = create_run(h_text, bold=True, size_pt=11.5, color="3C4043", font="Arial")
            body_elements.append(create_paragraph(runs, space_before=120, space_after=60))
        elif stripped.startswith("> "):
            quote_text = stripped[2:].strip()
            runs = parse_markdown_line_to_runs(quote_text, default_size=10.5, default_color="3C4043")
            body_elements.append(create_paragraph(runs, space_before=80, space_after=80, line_spacing=240))
        elif stripped.startswith("- ") or stripped.startswith("* "):
            bullet_text = stripped[2:].strip()
            runs = parse_markdown_line_to_runs(bullet_text, default_size=11.0)
            body_elements.append(create_paragraph(runs, bullet=True, space_before=20, space_after=40))
        elif re.match(r'^\d+\.\s', stripped):
            num_text = re.sub(r'^\d+\.\s', '', stripped)
            runs = parse_markdown_line_to_runs(num_text, default_size=11.0)
            body_elements.append(create_paragraph(runs, bullet=True, space_before=20, space_after=40))
        elif stripped == "---":
            # Horizontal rule divider
            divider_run = create_run("_________________________________________________________________________________", color="E8EAED", size_pt=8.0)
            body_elements.append(create_paragraph(divider_run, space_before=80, space_after=80, align="center"))
        else:
            # Regular paragraph
            runs = parse_markdown_line_to_runs(stripped, default_size=11.0, default_color="202124")
            body_elements.append(create_paragraph(runs, space_before=30, space_after=90, line_spacing=260))
            
        i += 1
        
    return "".join(body_elements)

def generate_docx(md_path: str, output_paths: List[str]):
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()
        
    body_xml = convert_markdown_to_docx_body(md_text)
    
    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    {body_xml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>
"""

    content_types_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>
"""

    rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""

    doc_rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>
"""

    numbering_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:nsid w:val="2B013589"/>
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:ind w:left="480" w:hanging="240"/>
      </w:pPr>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:hint="default"/>
        <w:color w:val="1A73E8"/>
      </w:rPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
</w:numbering>
"""

    styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:color w:val="202124"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="260" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  
  <w:style w:type="table" w:default="1" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:basedOn w:val="Normal"/>
    <w:uiPriority w:val="59"/>
    <w:tblPr>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="DADCE0"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="DADCE0"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="DADCE0"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="DADCE0"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E8EAED"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E8EAED"/>
      </w:tblBorders>
    </w:tblPr>
  </w:style>
</w:styles>
"""

    for out_path in output_paths:
        os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
        with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("[Content_Types].xml", content_types_xml)
            z.writestr("_rels/.rels", rels_xml)
            z.writestr("word/_rels/document.xml.rels", doc_rels_xml)
            z.writestr("word/document.xml", document_xml)
            z.writestr("word/styles.xml", styles_xml)
            z.writestr("word/numbering.xml", numbering_xml)
        print(f"Generated docx at: {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sub_md = os.path.join(base_dir, "SUBMISSION.md")
    
    outputs = [
        os.path.join(base_dir, "submission.docx"),
        os.path.join(base_dir, "frontend", "public", "submission.docx"),
        os.path.join(base_dir, "docs", "submission.docx")
    ]
    generate_docx(sub_md, outputs)
