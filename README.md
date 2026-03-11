# Flashcard PDF Maker

A simple web tool to turn text-based flashcard lists into printable double-sided PDFs.

## What it does

- Takes pairs of text (front + back) that you type or paste
- Shows a live preview with clickable flip cards
- Creates a PDF with:
  - All front sides on left-hand (odd) pages
  - All back sides on right-hand (even) pages, correctly ordered and rotated
  - So when you print double-sided ("flip on long edge"), each card lines up properly
- Lets you choose how many cards appear per page (4 to 20)

## How to use it

1. Enter your flashcards in the text area  
   One pair per line, separated by **two spaces**, **tab**, or **comma**:
6,7 or 6  7
text2. Adjust the **Cards per page** slider to control layout density

3. Click **Create PDF**

4. Type a filename in the PDF name field

5. Click **Download PDF**

6. Open the PDF and print it double-sided with the setting:  
**Flip on long edge** (sometimes called "long edge binding" or "flip on long side")
## Input rules

- Front text comes first
- Separator can be: two or more spaces, tab, or comma (with optional space after)
- Blank lines and malformed lines are ignored
- Minimum: at least one valid pair