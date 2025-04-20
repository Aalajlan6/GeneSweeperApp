import requests
from bs4 import BeautifulSoup
import csv
import json
from concurrent.futures import ThreadPoolExecutor

# Define URLs and login credentials
login_url = 'https://signon.jgi.doe.gov/signon/create'  # URL for the login page
csv_file_path = 'nitrous oxide reductase.csv'  # CSV with links to scrape
output_file_path = 'multioutput.fasta'  # Output file path
div_id = 'content_other'  # Change this to the div you want to scrape

# Create a session object to persist cookies and login info
session = requests.Session()

with open('config.json', 'r') as f:
    config = json.load(f)

username = config['username']
password = config['password']

# Data payload for the login form (you may need to inspect the login form for exact field names)
login_data = {
    'login': username,  # Update with actual field name
    'password': password,  # Update with actual field name
}

# Send the login request
login_response = session.post(login_url, data=login_data)

# Check if login was successful
if login_response.ok:
    print("Login successful!")
else:
    print("Login failed.")
    exit()

def scrape_url(url):
    try:
        # Now access the page after logging in
        page_response = session.get(url)
        page_response.raise_for_status()

        # Parse the page content
        soup = BeautifulSoup(page_response.text, 'html.parser')

        # Find the desired div and extract its text
        div_content = soup.find('div', id=div_id)
        
        if div_content:
            text1 = div_content.find('font').get_text(strip=True)
            text2 = div_content.find('font').next_sibling.strip()
            text_content = f"{text1}\n{text2}"
            return f"{text_content}\n"
        else:
            return f"URL: {url}\nError: Div not found\n\n"
            
    except requests.exceptions.RequestException as e:
        return f"URL: {url}\nError: {e}\n\n"

def multiscrape_urls(urls):
    with open(output_file_path, 'w') as output_file:
        # Use ThreadPoolExecutor to scrape URLs concurrently
        with ThreadPoolExecutor(max_workers=100) as executor:
            results = executor.map(scrape_url, urls)

        for result in results:
            output_file.write(result)

    print("Scraping completed.")
    return True

# # Open CSV and iterate through the URLs
# with open(csv_file_path, 'r') as csv_file:
#     csv_reader = csv.reader(csv_file)
#     urls = [row[1] for row in csv_reader]

# scrape_urls(urls)
