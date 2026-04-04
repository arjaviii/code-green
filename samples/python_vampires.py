import requests
import time

def process_data():
    results = []
    # VAMPIRE: Append in a loop (INEFFICIENT)
    for i in range(100):
        results.append(i * 2)

    # VAMPIRE: Frequent polling (ENERGY VAMPIRE)
    while True:
        requests.get("https://api.example.com/status")
        time.sleep(1)
