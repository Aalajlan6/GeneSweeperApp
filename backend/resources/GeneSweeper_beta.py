import pandas as pd
import os
import tkinter as tk
from tkinter import *
import csv
from matplotlib import pyplot as plt
from multiscraper import multiscrape_urls  # Import the multiscrape_urls function
#from scraper import scrape_urls  # Import the scrape_urls function

path = os.path.dirname(os.path.abspath(__file__))
csv_file_path = os.path.join(path, 'CSV_files')
out_file_path = os.path.join(path, 'Output_files')

extension = '.csv'
files = [file for file in os.listdir(csv_file_path) if file.endswith(extension)]
outFiles = []



df = pd.concat(pd.read_csv(os.path.join(csv_file_path, file), delimiter='\t') for file in files)
products = df['PRODUCT NAME'].unique()

#Show suggestions
def key_press(event, entry, listbox):
    input_text = entry.get()
    listbox.delete(0, tk.END)
    matching_products = [product for product in products if product.lower().startswith(input_text.lower())] # Change from starts with to include
    for product in matching_products[:10]:
        listbox.insert(tk.END, product)
    if not matching_products:
        listbox.insert(tk.END, "No products found")

#Add products to selected box
def on_list_select():
    selection = listbox.curselection()
    selected_items = []
    for index in selection:
        if listbox.get(index) != "No products found":
            selected_items.append(listbox.get(index))
    for item in selected_items:
        search_list.insert(tk.END, item)
    listbox.selection_clear(0, tk.END)

def on_begin():
    items_list = []
    all_items = []
    all_items = search_list.get(0, tk.END)
    
    for item in all_items:
        items_list.append(item)
    unique_items = set(items_list)
    golden_products = list(unique_items)
    if len(golden_products) > 0: #Main loop for Running filteration
        print(golden_products)
        for product in golden_products:
            filtered_df = df[df["PRODUCT NAME"].str.lower() == product.lower()]
            if '/' in product:
                product = product.replace('/', '_')
            filtered_df.to_csv(os.path.join(out_file_path, (product + ".csv")))
        print("done")
    else:
        print("No items are in cart!")
    outFiles = [file for file in os.listdir(out_file_path) if file.endswith(extension)] # Creates list of output files
    print(outFiles)

def on_clear():
    search_list.delete('0','end')
    
def startPage():
    root.withdraw()
    root2 = tk.Tk()
    root2.title("Product Search")
    global listbox, search_list  # Make listbox and search_list accessible globally
    entry = tk.Entry(root2, width=50)
    entry.place(x=200, y=200)
    entry.pack(padx=10, pady=10)
    input_text = entry.get()
    frame = tk.Frame(root2)
    frame.pack(padx = 10, pady= 10)
    listbox = tk.Listbox(frame, width=50, height=10, selectmode='multiple')
    listbox.grid(row=1, column=0)
    entry.bind('<KeyRelease>', lambda event: key_press(event, entry, listbox))
    


    products_label = tk.Label(frame, text="Choose Products for Search")
    products_label.grid(row=0, column=0)

    selected_label = tk.Label(frame, text="Cart")
    selected_label.grid(row=0, column=1)



    search_list = tk.Listbox(frame, width=50, height=10)
    search_list.grid(row=1, column=1)

    bframe = tk.Frame(root2)
    bframe.pack(padx = 10, pady= 10)
            
    button = tk.Button(bframe, text='Add to cart', command=on_list_select)
    button.grid(row=1, column=0, padx=10)
    button2 = tk.Button(bframe, text='Begin', command=on_begin)
    button2.grid(row=1, column=1, padx=10)
    button3 = tk.Button(bframe, text='Clear', command=on_clear)
    button3.grid(row=1, column=2, padx=10)
    button_back = tk.Button(bframe, text='Back to Main', command=lambda: back_to_root(root2))
    button_back.grid(row=2, column=1, padx=10, pady=10)

def startScraper():
    urls = linkGen()
    root.withdraw
    root3 = tk.Tk()
    root3.title('Welcome to GeneSweeper 3.0')
    root3.geometry('350x200')
    done = multiscrape_urls(urls)
    if done:
        #adding a label to the root window
        lbl = Label(root3, text = "\n\n\n                                 Done scraping!")
        lbl.place(x=175, y=25, anchor="center")
        lbl.grid()

def back_to_root(root2):
    # Close root2 and show the root window again
    root2.destroy()
    root.deiconify()
def linkGen():
    outFiles = [file for file in os.listdir(out_file_path) if file.endswith(extension)] # Creates list of output files
    urls = []
    for file in outFiles:
        with open(os.path.join(out_file_path, file), 'r') as f:
            reader = csv.reader(f)
            next(reader)  # Skip the header row
            for row in reader:
                id, _, ga = row[1].split()[:3]
                url = f"https://img.jgi.doe.gov/cgi-bin/mer/main.cgi?section=MetaGeneDetail&page=genePageMainFaa&taxon_oid={id}&data_type=assembled&gene_oid={ga}"
                urls.append(url)
    return urls

#Main loop
root = tk.Tk()
root.title("Main Window")
root.geometry("300x400")

button_to_open_root2 = tk.Button(root, text="Open Product Search", command=startPage)
button_to_open_root2.pack(pady=20)
button_to_open_scraper = tk.Button(root, text="Scrape FASTA files", command=startScraper)
button_to_open_scraper.pack(pady=20)

root.mainloop()

print("done")
