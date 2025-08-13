import requests
from bs4 import BeautifulSoup
import json

base_url = "https://www.paulgraham.com/"
articles_url = f"{base_url}articles.html"

print(f"{articles_url}")

try:
    response = requests.get(articles_url)
    response.raise_for_status()

    soup = BeautifulSoup(response.content, 'html.parser')
    essay_links = soup.select('table a[href$=".html"]')

    essays_data = []
    for link in essay_links:
        title = link.get_text(strip=True)
        relative_url = link.get('href')
        full_url = f"{base_url}{relative_url}"

        essays_data.append({
            "title": title,
            "url": full_url
        })

    file_name = "pg-lista/essays.json"
    with open(file_name, 'w', encoding='utf-8') as f:
        json.dump(essays_data, f, indent=4, ensure_ascii=False)

    print(f"Zapisano {len(essays_data)}{file_name}'.")

except requests.exceptions.RequestException as e:
    print(f"Błąd pobierania strony: {e}")
except Exception as e:
    print(f"Wystąpił nieoczekiwany błąd: {e}")