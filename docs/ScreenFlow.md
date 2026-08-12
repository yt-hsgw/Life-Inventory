# Screen Flow

```mermaid
flowchart TD
  Login --> Dashboard
  Dashboard --> Items
  Dashboard --> Review
  Dashboard --> Ideal
  Dashboard --> Expenses
  Items --> AddItem
  Items --> ItemDetail
  ItemDetail --> EditItem
  ItemDetail --> Review
  ItemDetail --> Archive
  Ideal --> IdealForm
  Expenses --> ExpenseForm
  Dashboard --> Settings
  Settings --> Categories
```
