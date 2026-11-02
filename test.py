import requests

url = "https://script.google.com/macros/s/AKfycbwHRz8zkPitsXK28w3oYdkj3STKw09kXmpKHsswYpZ1jJ6cAE6Zl-MKv39XoopVqw-3Sg/exec?key=mypf2025"

data = {
    "key": "mypf2025",
    "date": "2026-06-16",
    "description": "Dinner at BBQ Nation",
    "name": "Viraj",
    "amount": -1200,
    "transactionType": "Debit",
    "category": "Food",
    "accountName": "HDFC Savings",
    "toAccount": ""
}

response = requests.post(url, json=data, allow_redirects=True)
print(response.status_code)
print(response.text)