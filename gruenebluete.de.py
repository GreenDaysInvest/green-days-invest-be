import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json

def get_product_links(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " \
                      "AppleWebKit/537.36 (KHTML, like Gecko) " \
                      "Chrome/112.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException:
        return set()

    soup = BeautifulSoup(response.text, 'html.parser')
    links = set()

    for a_tag in soup.find_all('a', class_='full-unstyled-link', href=True):
        href = a_tag['href']
        if href.startswith('/products/'):
            absolute_url = urljoin(url, href)
            links.add(absolute_url)

    return links

def get_all_product_links(base_url):
    all_links = set()
    page = 1

    while True:
        paged_url = f"{base_url}&page={page}"
        links = get_product_links(paged_url)
        
        if not links:
            break
        
        previous_count = len(all_links)
        all_links.update(links)
        
        # Beende die Schleife, wenn keine neuen Links hinzugefügt wurden
        if len(all_links) == previous_count:
            break

        page += 1

    return all_links

def extract_product_info(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " \
                      "AppleWebKit/537.36 (KHTML, like Gecko) " \
                      "Chrome/112.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException:
        return None

    soup = BeautifulSoup(response.text, 'html.parser')

    # Extrahiere den Namen
    name_tag = soup.find('h1', class_='product__title')
    name = name_tag.get_text(strip=True) if name_tag else 'N/A'

    # Extrahiere das Bild
    image_div = soup.find('div', class_='product__media media media--transparent')
    image = 'N/A'
    if image_div:
        img_tag = image_div.find('img')
        if img_tag and img_tag.get('src'):
            src = img_tag['src']
            if src.startswith('//'):
                image = 'https:' + src
            elif src.startswith('/'):
                image = urljoin(url, src)
            else:
                image = src

    # Extrahiere Genetik, THC, CBD
    genetic = 'N/A'
    thc = 'N/A'
    cbd = 'N/A'

    description_divs = soup.find_all('div', class_='product__description')
    for div in description_divs:
        p_tags = div.find_all('p')
        for p in p_tags:
            strong = p.find('strong')
            if strong:
                label = strong.get_text(strip=True).lower()
                if 'genetik' in label:
                    genetic = p.get_text(separator=' ', strip=True).replace('Genetik:', '').strip()
                elif 'thc' in label:
                    thc = p.get_text(strip=True).replace('THC:', '').strip()
                elif 'cbd' in label:
                    cbd = p.get_text(strip=True).replace('CBD:', '').strip()

    # Setze die Verfügbarkeit auf 'Available'
    availability = 'Available'

    return {
        'Farmacy': 'Gruenebluete.de',
        'Name': name,
        'Image': image,
        'Genetic': genetic,
        'THC': thc,
        'CBD': cbd,
        'Availability': availability,
        'Link': url  # Link hinzugefügt
    }

def main():
    base_url = 'https://gruenebluete.de/collections/cannabisblueten?filter.p.product_type=Bl%C3%BCten'
    product_links = get_all_product_links(base_url)
    products = []

    for link in sorted(product_links):
        info = extract_product_info(link)
        if info:
            products.append(info)

    # Ausgabe als Liste
    print(products)

    # Optional: Speichern der Liste als JSON-Datei
    with open('produkte.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
        main()
