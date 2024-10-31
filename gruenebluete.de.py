import requests
from bs4 import BeautifulSoup
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# Funktion zum Abrufen der Webseite mit angepasstem User-Agent
def get_webpage(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Fehler beim Abrufen der Seite: {e}")
        return None

# Funktion zum Abrufen des Preises von der Produktseite mit Retry-Logik
def get_product_price(product_url, session, retries=3):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://gruenebluete.de/',
        'Accept-Language': 'de-DE,de;q=0.9',
    }
    for attempt in range(retries):
        try:
            response = session.get(product_url, headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Preis finden
            price_element = soup.select_one("div.ct-text-block.product-info-text:-soup-contains('Preis')")
            if price_element:
                price = price_element.get_text(strip=True).replace('Preis:', '').strip()
            else:
                alternative_price_element = soup.find('span', string=lambda text: text and '€' in text)
                price = alternative_price_element.get_text(strip=True) if alternative_price_element else "Preis nicht gefunden"
            return price
        except requests.RequestException as e:
            print(f"Fehler beim Abrufen des Preises (Versuch {attempt+1}): {e}")
            time.sleep(2 ** attempt)  # Exponential backoff
    return "Fehler beim Abrufen des Preises"

# Funktion zur Verarbeitung der Hauptseite und Extraktion der Produkte in Batches
def parse_page(html_content, session, batch_size=10):
    soup = BeautifulSoup(html_content, 'html.parser')
    products = soup.find_all('a', class_='product-card')
    
    strains = []
    for i in range(0, len(products), batch_size):
        batch = products[i:i + batch_size]
        with ThreadPoolExecutor(max_workers=10) as executor:  # Increased max_workers for faster processing
            futures = {}
            for product in batch:
                # Name der Sorte
                name_element = product.find('h4', class_='ct-headline article-card-title mt-3 mx-3 product-card-title')
                name = name_element.get_text(strip=True) if name_element else "Unbekannt"
                
                # Bild-URL
                image_element = product.find('img', class_='ct-image article-card-image webpexpress-processed')
                image = image_element['src'] if image_element else "Unbekannt"
                
                # Produktlink
                link = product['href'] if product.has_attr('href') else "Unbekannt"
                
                # Genetik der Sorte
                genetics_element = product.find('div', class_='ct-text-block product-card-genetik mx-3 mt-2')
                genetics = genetics_element.get_text(strip=True) if genetics_element else "Keine Angabe"
                
                # THC-Gehalt
                thc_element = product.find('div', class_='ct-div-block mx-3 align-items-center product-label-container')
                thc_value = 'N/A'
                if thc_element:
                    thc_span = thc_element.find('span', class_='ct-span')
                    thc_value = thc_span.get_text(strip=True) if thc_span else 'N/A'
                
                # CBD-Gehalt
                cbd_value = 'N/A'
                if thc_element:
                    cbd_spans = thc_element.find_all('span', class_='ct-span')
                    if len(cbd_spans) > 1:
                        cbd_value = cbd_spans[1].get_text(strip=True)
                
                # Verfügbarkeit
                availability_element = product.find('div', class_='availability-text')
                availability = availability_element.get_text(strip=True) if availability_element else "Nicht angegeben"
                
                # Parallel Anfrage zum Preis abrufen
                if link != "Unbekannt":
                    futures[executor.submit(get_product_price, link, session)] = {
                        'Name': name,
                        'Image': image,
                        'Link': link,
                        'Genetic': genetics,
                        'THC': thc_value,
                        'CBD': cbd_value,
                        'Availability': availability
                    }
            
            for future in as_completed(futures):
                strain_info = futures[future]
                strain_info['Price'] = future.result()
                strains.append(strain_info)
        
        time.sleep(0.5)  # Delay between batches to prevent overloading server
    
    return strains

# Hauptfunktion für den Scraping-Prozess
def main():
    url = 'https://gruenebluete.de/cannabis-sorten/cannabisblueten/'
    html_content = get_webpage(url)
    
    if html_content:
        with requests.Session() as session:
            strains = parse_page(html_content, session)
            if strains:
                # Return as JSON string
                return json.dumps(strains, ensure_ascii=False, indent=4)
            else:
                return json.dumps({"error": "Keine Sorten gefunden."}, ensure_ascii=False, indent=4)
    else:
        return json.dumps({"error": "Die Webseite konnte nicht abgerufen werden."}, ensure_ascii=False, indent=4)

# Aufruf der Hauptfunktion und Ausgabe im JSON-Format
json_result = main()
print(json_result)
