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
- [ ] 基于 notion 模型的分析，讨论下 why expressive，以及需要的 ops （ops 也包括 + 和 x）



Create and Delete. Operations of \textit{create} and \textit{delete} can be realized by directly adding or removing variables in mappings from original datasets loaded by related functionalities in the user interface (e.g., loading local files, entering / deleting values in sheets). In particular, applying \textit{filtering} functions can also delete rows.}
  
Transform. Operations of \textit{transform} modifies the arrangement or the content of variables in tables. The former can be realized by rearranging variables in mappings, implementing functionalities of \textit{relocating}, \textit{folding} / \textit{unfolding}, \textit{transposing}, etc. In addition, some specific transform functions such as \textit{sorting} can sort values of a variable and rearrange tables based on the new order. Other generic transform functions such as \textit{formatting}, can be used to modify the content of variables in tables.}
  
Separate. \textit{Separate} operations separate variables of a table into multiple tables or separate values of a variable into multiple variables and then rearrange these variables. The former can be directly implemented using mappings. The latter first requires \textit{separate} functions or specific \textit{transform} functions that change the number of values (e.g., \textit{unnesting} and \textit{filtering}) to separate variables, and then these separated variables can be arranged in mappings.}
  
Combine. \textit{Combine} operations combine multiple variables in different tables or columns and rearrange a new table or column, which can be realized by \textit{combine} functions and mappings. In addition, \textit{combine} operations can also summarize or interpolate rows. The former can be implemented by mapping categorical variables into the row channel with aggregating functions. The latter usually fills missing values based on the values of other rows, which directly retrieve and operate data values, violating Rigel's data variable mapping principles to indirectly arrange values. As such, Rigel cannot support the operation currently.


## Cases

- [ ] 基础 case 可以借鉴 Arquero（https://observablehq.com/@uwdata/an-illustrated-guide-to-arquero-verbs?collection=@uwdata/arquero） 的
- [ ] complex cases（数据弄复杂点，几十个 columns，几百 rows，ops 可能差不多？不过把原本 ops sequence 列了出来，多举几个列在 gallery 里。）
- [ ] open-ended exploration cases（探索不同 shape 的作用）

“I am not sure how many use-cases exist where users do data transformation just for the sake of transforming data into different layouts. I would like to see more use-cases (ideally a user study?) that show the benefits of arranging the same data into different layouts and if it helps in obtaining new data insights.”

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
