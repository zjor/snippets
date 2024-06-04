package main

import (
	"encoding/json"
	"fmt"
	"os"
	"royz.cc/invoicer/client"
	"strings"
	"time"
)

type InvoiceItem struct {
	Name string  `json:"name"`
	Qty  float64 `json:"qty"`
	Rate float64 `json:"rate"`
}

type InvoiceData struct {
	From   []string      `json:"from"`
	To     []string      `json:"to"`
	Notes  []string      `json:"notes"`
	Prefix string        `json:"prefix"`
	Items  []InvoiceItem `json:"items"`
}

func (v *InvoiceData) toClientItems() []client.Item {
	var items []client.Item
	for _, item := range v.Items {
		if item.Qty == 0 {
			continue
		}
		items = append(items, client.Item{
			Name:     v.Prefix + " " + item.Name,
			Quantity: item.Qty,
			UnitCost: item.Rate,
		})
	}
	return items
}

func main() {
	bytes, err := os.ReadFile("./.data.json")
	if err != nil {
		panic(err)
	}
	var invoiceData InvoiceData
	err = json.Unmarshal(bytes, &invoiceData)
	if err != nil {
		panic(err)
	}

	invoiceNumber := time.Now().Format("2006-01-02")

	invoice := client.Invoice{
		From:     strings.Join(invoiceData.From, "\n"),
		To:       strings.Join(invoiceData.To, "\n"),
		Number:   invoiceNumber,
		Currency: "USD",
		Date:     time.Now().Format("2006-01-02"),
		DueDate:  time.Now().Add(time.Hour * 24 * time.Duration(14)).Format("2006-01-02"),
		Notes:    strings.Join(invoiceData.Notes, "\n"),
		Items:    invoiceData.toClientItems(),
	}

	path := "/Users/zjor/projects/ion/accounting/2024/may/two"
	saveTo := fmt.Sprintf("%s/ad-%s.pdf", path, invoiceNumber)
	invoice.Create(saveTo)
}
