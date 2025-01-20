import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json

def get_product_links_and_prices(url):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, wie Gecko) "
            "Chrome/112.0.0.0 Safari/537.36"
        )
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException:
        # Fehler beim Abrufen der Seite werden still ignoriert
        return []
    
    soup = BeautifulSoup(response.text, 'html.parser')
    products = []
    
    # Iteriere über alle Produktkarten auf der Seite
    for card in soup.find_all('div', class_='card-wrapper product-card-wrapper underline-links-hover'):
        a_tag = card.find('a', class_='full-unstyled-link', href=True)
        if a_tag and a_tag['href'].startswith('/products/'):
            absolute_url = urljoin(url, a_tag['href'])
            
            # Extrahiere den Preis
            price_div = card.find('div', class_='price')
            price = 'N/A'
            if price_div:
                # Versuche zuerst den Verkaufspreis zu finden
                sale_price_span = price_div.find('span', class_='price-item price-item--sale price-item--last')
                if sale_price_span:
                    price = sale_price_span.get_text(strip=True)
                else:
                    # Fallback zum regulären Preis
                    regular_price_span = price_div.find('span', class_='price-item price-item--regular')
                    if regular_price_span:
                        price = regular_price_span.get_text(strip=True)
            
            products.append({'url': absolute_url, 'price': price})
    
    return products

def get_all_product_links(base_url):
    all_products = []
    page = 1

    while True:
        paged_url = f"{base_url}&page={page}"
        products = get_product_links_and_prices(paged_url)
        
        if not products:
            # Keine weiteren Produkte gefunden. Beende die Schleife.
            break
        
        previous_count = len(all_products)
        all_products.extend(products)
        
        # Beende die Schleife, wenn keine neuen Produkte hinzugefügt wurden
        if len(all_products) == previous_count:
            break

        page += 1

    return all_products

def extract_product_info(url):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, wie Gecko) "
            "Chrome/112.0.0.0 Safari/537.36"
        )
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException:
        # Fehler beim Abrufen des Produkts werden still ignoriert
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

    for product in sorted(product_links, key=lambda x: x['url']):
        info = extract_product_info(product['url'])
        if info:
            # Füge den Preis aus der Sammlungseite hinzu
            info['Price'] = product['price']
            products.append(info)

    # Ausgabe als Liste
    print(json.dumps(products, ensure_ascii=False, indent=4))


if __name__ == "__main__":
        main()
