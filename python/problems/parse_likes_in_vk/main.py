from bs4 import BeautifulSoup
from airtable import airtable

at = airtable.Airtable('...', '...')
table_name = "..."

if __name__ == "__main__":
    filename = "/Users/zjor/tmp/contacts.html"
    with open(filename) as f:
        html = f.read()
        soup = BeautifulSoup(html, 'html.parser')
        items = soup.find_all('div', attrs={'class': 'fans_fan_name'})
        for item in items:
            child = next(item.children)
            vk_id, username = child['href'], child.string
            vk_id = f"https://vk.com{vk_id}"
            f_name, l_name = username.split(' ')
            at.create(table_name, data={
                "First Name": f_name,
                "Last Name": l_name,
                "Username": vk_id,
                "Source": "Vkontakte",
                "Status": "Pending"
            })
