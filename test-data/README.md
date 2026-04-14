# Test Data for Spreadsheet Merger

This folder contains sample CSV files for testing the Spreadsheet Merger application.

## Files

### 1. `customers.csv`

**Headers:** Yes  
**Columns:** CustomerID, Name, Email, City, Country  
**Records:** 8 customers  
**Use:** Use this as the primary file in your merge. The CustomerID column is a common key for merging with other files.

### 2. `orders.csv`

**Headers:** Yes  
**Columns:** OrderID, CustomerID, OrderDate, TotalAmount, Status  
**Records:** 10 orders  
**Use:** Merge with customers.csv by CustomerID. This will combine customer information with their order details.

### 3. `products.csv`

**Headers:** Yes  
**Columns:** ProductID, ProductName, Category, Price, Supplier  
**Records:** 10 products  
**Use:** Standalone file or merge with inventory.csv by ProductID for a complete product-inventory view.

### 4. `inventory.csv`

**Headers:** Yes  
**Columns:** ProductID, SKU, WarehouseLocation, QuantityInStock, ReorderLevel, LastRestockDate  
**Records:** 10 products  
**Use:** Merge with products.csv by ProductID to get product names with stock levels.

### 5. `regional_sales.csv`

**Headers:** Yes  
**Columns:** CustomerID, Region, Sales2023, Sales2024, YoYGrowth  
**Records:** 8 customers  
**Use:** Merge with customers.csv by CustomerID to see customer contact info alongside their regional sales data.

### 6. `customer_scores.csv`

**Headers:** No ⚠️  
**Columns:** (No headers - you'll need to provide them)  
**Records:** 8 customers  
**Field interpretation:** CustomerID, LoyaltyScore, PurchaseFrequency, AverageOrderValue, IsVIP  
**Use:** Test the header configuration feature. When uploading, select "No, I'll provide headers" and enter the field names. Then merge with customers.csv by CustomerID.

## Test Scenarios

### Scenario 1: Basic Customer-Order Merge

1. Upload `customers.csv` (has headers) and `orders.csv` (has headers)
2. Select `CustomerID` as the merge column
3. Select all columns you want to see
4. Export the result - you should see 7 merged rows (only customers with orders)

### Scenario 2: Product-Inventory Merge

1. Upload `products.csv` and `inventory.csv`
2. Select `ProductID` as the merge column
3. Choose columns: ProductName, Category, Price, QuantityInStock, WarehouseLocation
4. Export - you'll see all 10 products with their stock information

### Scenario 3: Customer Profile Enrichment

1. Upload `customers.csv`, `orders.csv`, and `regional_sales.csv`
2. First merge: Select `CustomerID` as the merge column
3. Export intermediate result
4. You should see customers with their order and regional sales data

### Scenario 4: Testing without Headers

1. Upload `customer_scores.csv`
2. When prompted, select "No, I'll provide headers"
3. Enter headers: `CustomerID`, `LoyaltyScore`, `PurchaseFrequency`, `AverageOrderValue`, `IsVIP`
4. Upload `customers.csv` as a second file
5. Merge by `CustomerID` to see customer info with their loyalty scores

## Notes

- All CustomerID values are consistent across files for proper merging
- Use inner join strategy (only matching records are included)
- Some files have more records than others to test merge behavior
- The application will only show rows where ALL files have matching keys
- Try exporting in both CSV and Excel formats

## Tips for Testing

✅ **Do test:**

- Merging files with different column counts
- Merging more than 2 files at once
- Selecting different subsets of columns
- Files with and without headers
- CSV export with special characters

❌ **Don't test:**

- Files larger than shown here (for now)
- Multiple sheets in Excel (only first sheet is used)
- Merging on non-existent columns
