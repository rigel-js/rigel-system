# Appendix -  Example gallery

To evaluate the expressiveness extent of Rigel, we create a gallery of diverse transformation cases (**xx cases**).
These cases demonstrate the substantial coverage over Kasica et al.'s [[1]](#references) framework of basic multi-table data wrangling operations as follows (**20/21**), suggesting that it may offer potential support for complex tasks.

## Coverage over Kasica et al.'s framework

|   | Table | Row | Column |
| - | - | - | - |
| Create | :heavy_check_mark:Create Tables ([3 cases](#create-tables))	| :heavy_check_mark:Create Rows | :heavy_check_mark:Create Columns |
| Delete | :heavy_check_mark:Delete Tables	| :heavy_check_mark:Delete Rows | :heavy_check_mark:Delete Columns |
| Transform | :heavy_check_mark:Rearrange Tables<br>:heavy_check_mark:Reshape Tables | :heavy_check_mark:Transform Rows | :heavy_check_mark:Transform Column |
| Separate | :heavy_check_mark:Subset Tables<br>:heavy_check_mark:Decompose Tables<br>:heavy_check_mark:Split Tables | :heavy_check_mark:Separate Rows | :heavy_check_mark:Separate Columns |
| Combine | :heavy_check_mark:Extend Tables<br>:heavy_check_mark:Supplement Tables<br>:heavy_check_mark:Match Tables | :heavy_check_mark:Summarize Rows<br>:x:Interpolate Rows | :heavy_check_mark:Combine Columns |

### Discuss
- [ ] 基于 notion 模型的分析，讨论下 why expressive，以及需要的 ops
- [ ] case 要不直接用 Arquero 的

## Cases

:white_check_mark: Rigel can complete the case.<br>
:ballot_box_with_check: A future version of Rigel with more (derivation) functions can complete the case.<br>
:x: Rigel's declarative mapping approach cannot cover the case.


### Create Tables 

**Definition:** Import one or more tables to the workspace.

**Illustration:** ![create-tables](/pics/create-tables.png)

| Case | Description | Rigel's Applicability | 
| - | - | - |
| (Omitted) | *Fetch* from external sources, such as a HTTP request to publicly accessible API. | :ballot_box_with_check: |
| (Omitted) | *Create* directly in the wrangling environment. | :ballot_box_with_check: |
| (Omitted) | *Load* locally from a file or database. | :white_check_mark: |

### Create Columns 

**Definition:**  Add a new column directly into some table, without referring to other data sources.

**Illustration:** ![create-columns](/pics/create-columns.png)

| Case | Description | Rigel's Applicability | 
| - | - | - |
|  | *Add* a new column as the first column with header values to a table without column headers. | :ballot_box_with_check: |
|  | *Add* a new column with header values to a table with column headers. | :ballot_box_with_check: |
|  | *Add* a new column with cell values. | :white_check_mark: |

### Create Rows 

| Case | Description | Rigel's Applicability | 
| - | - | - |
| ![create-rows](/pics/create-rows.png) | *Fetch* from external sources, such as a HTTP request to publicly accessible API. | :ballot_box_with_check: |
|  | *Create* directly in the wrangling environment. | :ballot_box_with_check: |
|  | *Load* locally from a file or database. | :white_check_mark: |


 ### Rearrange Tables

| Case | Description | Rigel's Applicability | 
| - | - | - |
|  | *Sort*. |  |
|  | Rearrange columns. |  |
|  | Rearrange rows? |  |

...

### Separate Rows

| Case | Description | Rigel's Applicability | 
| - | - | - |
| ![create-tables](/pics/separate-row-1.png) | Emmm 这个也不完全是. | |


## References

[1] S. Kasica, C. Berret, and T. Munzner. Table Scraps: An Actionable Framework for Multi-Table Data Wrangling From An Artifact Study of Computational Journalism. IEEE TVCG, 27(2):957-966, 2021.
