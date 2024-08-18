from flask import Flask, request, render_template, redirect, url_for, session
app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/index.html')
def index():
    return render_template('index.html')


@app.route('/enterprises.html')
def enterprises():
    return render_template('enterprises.html')

@app.route('/accounting_services.html')
def accounting_services():
    return render_template('accounting_services.html')

@app.route('/banks.html')
def banks():
    return render_template('banks.html')

@app.route('/admin.html')
def admin():
    return render_template('admin.html')

@app.route('/sales_purchases.html')
def sales_purchases():
    return render_template('sales_purchases.html')

@app.route('/tax_compliance.html')
def tax_compliance():
    return render_template('tax_compliance.html')


import plotly.express as px
import pandas as pd


# Load the CSV file into a pandas DataFrame
receipts_df = pd.read_csv('C:/Users/lenovo/Desktop/asanbi/AsanBI_web/static/receipt_data.csv')

# Process data for pie and bar charts
bank_data = receipts_df.groupby('Bank')['Amount'].sum().reset_index()
description_data = receipts_df.groupby('Description')['Amount'].sum().reset_index()

@app.route('/visualize.html')
def visualize():
    # Generate pie chart
    pie_fig = px.pie(bank_data, names='Bank', values='Amount', title='Bank-wise Distribution of Receipts')
    pie_chart_html = pie_fig.to_html(full_html=False)

    # Generate bar chart
    bar_fig = px.bar(description_data, x='Description', y='Amount', title='Amount by Description')
    bar_chart_html = bar_fig.to_html(full_html=False)

    return render_template('visualize.html', pie_chart_html=pie_chart_html, bar_chart_html=bar_chart_html)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
