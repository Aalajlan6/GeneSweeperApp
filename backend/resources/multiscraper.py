import requests
from bs4 import BeautifulSoup
import csv
import sys
import os

# Check arguments
if len(sys.argv) < 4:
    print("Usage: python multiscraper.py <csv_file_path> <jgi_username> <jgi_password>")
    sys.exit(1)

csv_file_path = sys.argv[1]
jgi_username = sys.argv[2]
jgi_password = sys.argv[3]

# Configs
login_url = 'https://signon.jgi.doe.gov/signon/create'
output_file_path = os.path.join(os.path.dirname(__file__), 'multioutput.fasta')
div_id = 'content_other'

# Create a session object
session = requests.Session()

# Login payload
login_data = {
    'login': jgi_username,
    'password': jgi_password,
}

# Send login request
login_response = session.post(login_url, data=login_data)

if login_response.ok:
    print("Login successful!")
else:
    print("Login failed.")
    sys.exit(1)

# 🔥 Function to generate the correct list of URLs
def linkGen(csv_path):
    urls = []
    with open(csv_path, 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        for row in reader:
            try:
                print("[DEBUG] Raw row:", row)
                id_field, _, ga_field = row[0].split()[:3]
                print("[DEBUG] Parsed fields:", id_field, ga_field)
                url = f"https://img.jgi.doe.gov/cgi-bin/mer/main.cgi?section=MetaGeneDetail&page=genePageMainFaa&taxon_oid={id_field}&data_type=assembled&gene_oid={ga_field}"
                urls.append(url)
            except Exception as e:
                print(f"[DEBUG] Error parsing row: {row} — {e}")
    return urls

# Function to scrape one URL
def scrape_url(url):
    try:
        print(f"[DEBUG] Scraping URL: {url}")
        page_response = session.get(url)
        page_response.raise_for_status()
        soup = BeautifulSoup(page_response.text, 'html.parser')
        div_content = soup.find('div', id=div_id)
        if div_content:
            text1 = div_content.find('font').get_text(strip=True)
            text2 = div_content.find('font').next_sibling.strip()
            return f"{text1}\n{text2}\n"
        else:
            return f"URL: {url}\nError: Div not found\n\n"
    except requests.exceptions.RequestException as e:
        return f"URL: {url}\nError: {e}\n\n"

# Function to scrape multiple URLs
def multiscrape_urls(urls):
    with open(output_file_path, 'w') as output_file:
        for i, url in enumerate(urls):
            print(f"[{i+1}/{len(urls)}] Scraping: {url}")
            output_file.write(scrape_url(url))
    print("Scraping completed.")

# 🔥 Now generate correct URLs, then scrape them
urls = linkGen(csv_file_path)
multiscrape_urls(urls)
