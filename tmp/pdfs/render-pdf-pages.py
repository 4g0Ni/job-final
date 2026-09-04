from pathlib import Path

import pypdfium2 as pdfium


ROOT = Path(r"D:\Job\job-final")
JOBS = {
    "zh": ROOT / "简历" / "刘启仁_AI应用与Agent工程_中文简历_MT版.pdf",
    "en": ROOT / "简历" / "Qiren_Liu_AI_Agent_Backend_Software_Engineer_Resume.pdf",
}

for language, source in JOBS.items():
    output_dir = ROOT / "tmp" / "pdfs" / language
    output_dir.mkdir(parents=True, exist_ok=True)
    for old_page in output_dir.glob("page-*.png"):
        old_page.unlink()
    document = pdfium.PdfDocument(source)
    for index in range(len(document)):
        page = document[index]
        bitmap = page.render(scale=2.0)
        bitmap.to_pil().save(output_dir / f"page-{index + 1}.png")
        page.close()
    document.close()
    print(f"{language}: {len(list(output_dir.glob('page-*.png')))} page(s)")
