import requests
from bs4 import BeautifulSoup
import csv
import sys
import os

# Get the CSV file path and JGI credentials from the command-line arguments
if len(sys.argv) < 4:
    print("Usage: python multiscraper.py <csv_file_path> <jgi_username> <jgi_password>")
    sys.exit(1)

csv_file_path = sys.argv[1]
jgi_username = sys.argv[2]
jgi_password = sys.argv[3]

# Define URLs and login credentials
login_url = 'https://signon.jgi.doe.gov/signon/create'
output_file_path = os.path.join(os.path.dirname(__file__), 'multioutput.fasta')
div_id = 'content_other'

# Create a session object to persist cookies and login info
session = requests.Session()

# Data payload for the login form
login_data = {
    'login': jgi_username,
    'password': jgi_password,
}

# Send the login request
login_response = session.post(login_url, data=login_data)

# Check if login was successful
if login_response.ok:
    print("Login successful!")
else:
    print("Login failed.")
    sys.exit(1)

# Function to scrape a URL
def scrape_url(url):
    try:
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
        for url in urls:
            output_file.write(scrape_url(url))
    print("Scraping completed.")

# Read URLs from the CSV file
with open(csv_file_path, 'r') as csv_file:
    csv_reader = csv.reader(csv_file)
    urls = [row[0] for row in csv_reader]

multiscrape_urls(urls)
