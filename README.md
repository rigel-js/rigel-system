# Rigel: Transforming Tabular Data By Declarative Mapping

[Online Demo](https://rigel-system.github.io/rigel-system/)

This repo is the official implementation of Rigel, an interactive table transformation system based on declarative specifications.

[TOC]

## Transformation categories

To illustrate the transformation capability of Rigel, we summarize the potential transformation categories that can be done by Rigel in the following table. Note that the taxonomy and definition of operations is based on the framework from [1].

| Operation                    | Our model’s applicability |
| ---------------------------- | ------------------------- |
| Create Table                 | Yes                       |
| Create Columns               | Yes                       |
| Create Rows                  | Yes                       |
| Delete Tables                | Yes                       |
| Delete Columns               | Yes                       |
| Delete Rows                  | Yes                       |
| Transform Tables - Rearrange | Yes                       |
| Transform Tables - Reshape   | Yes                       |
| Transform Columns            | Yes                       |
| Transform Rows               | Yes                       |
| Separate Tables - Subset     | Yes                       |
| Separate Tables - Decompose  | Yes                       |
| Separate Tables - Split      | Yes                       |
| Separate Columns             | Yes                       |
| Separate Rows                | Yes                       |
| Combine Tables - Extend      | Yes                       |
| Combine Tables - Supplement  | Yes                       |
| Combine Tables - Match       | Yes                       |
| Combine Columns              | Yes                       |
| Combine Rows - Summarize     | Yes                       |
| Combine Rows - Interpolate   | No                        |



For all valid operations, we provide the corresponding details as follows.

### Create Tables

**Definition: **Import one or more tables to the workspace from some exterior source.

**Illustration:** ![create-tables](.\pics\create-tables.png) 

**Example:**  In Rigel, users can import a table using the *Choose File* button and select the CSV file on his/her own. Also, users can directly import some example tables prepared by us.



### Create Columns

**Definition:** Add a new column directly into some table, without referring to other data sources.

**Illustration:** ![create-columns](.\pics\create-columns.png) 

**Example:** Omitted. (This function can be directly integrated into the spreadsheet toolkit.)



### Create Rows

**Definition:** Add a new row directly into some table, without referring to other data sources.

**Illustration:** ![create-rows](.\pics\create-rows.png) 

**Example:** Omitted. (This function can be directly integrated into the spreadsheet toolkit.)



### Delete Tables

**Definition:** Delete one or more tables from the workspace, either explicitly or implicitly.

**Illustration: ** ![delete-tables](.\pics\delete-tables.png)

**Example: **In Rigel, deleting a table explicitly is equivalent to removing a table from the source view. (For the current version, this function is still under development.) Similarly, the implicit delete operation, i.e. deleting some table viewed as a sub-operation when performing other operations, can also be easily supported in Rigel. However, we keep the original table in most operations and prefer the explicit deletion, enabling users to exert further operations on the original table.



### Delete Columns

**Definition:** Delete one or more arbitrary columns from the workspace.

**Illustration: ** ![delete-columns](.\pics\delete-columns.png)

**Example: **Take removing repeated variables as example. Consider the original specification is  *(state), () => (crime + crime)*, we can remove the duplicated *crime* by simply deleting it from the *cell* part. The derived specification will be *(state), () => (crime)*.

**Example Input:** 

|         | Crime       | Crime       |
| ------- | ----------- | ----------- |
| Alabama | 4029.3,3900 | 4029.3,3900 |
| Alaska  | 3937,3974.9 | 3937,3974.9 |

**Example Output:**

|         | Crime       |
| ------- | ----------- |
| Alabama | 4029.3,3900 |
| Alaska  | 3937,3974.9 |



### Delete Rows

**Definition:** Delete one or more arbitrary rows from the workspace.

**Illustration: ** ![delete-rows](.\pics\delete-columns.png)

**Example: **Similar to deleting rows, we can remove irrelevant or repeated rows by deleting from the *cell* part in the specification or  using operations like *filter* on variables in the *row* part.



### Transform Tables - Rearrange

**Definition:** Transform tables while maintaining the original schema.

**Illustration: ** ![transform-tables-rearrange](.\pics\transform-tables-rearrange.png)

**Example: **The *sort* operation in Rigel is an example. Specifically, by changing the specification from *(state), (year) => (crime)* to *(ascsort(state)), (year) => (crime)*, we can rearrange the rows according to the alphabetical order of the state names, where *ascsort* means sorting the variable in ascending order. Moreover, Rigel also has the potential to support more arbitrary rearrangements by adding more aggregation functions into the system.

**Example Input:** 

| State                | 2004   |
| -------------------- | ------ |
| Alabama              | 4029.3 |
| District of Columbia | 4852.8 |
| California           | 3423.9 |
| New Jersey           | 2433.0 |

**Example Output:**

|                      | 2004   |
| -------------------- | ------ |
| Alabama              | 4029.3 |
| California           | 3423.9 |
| District of Columbia | 4852.8 |
| New Jersey           | 2433.0 |



### Transform Tables - Reshape

**Definition:** Transform tables as well as the schema.

**Illustration: ** ![transform-tables-reshape](.\pics\transform-tables-reshape.png)

**Example: **In Rigel, most interactions fall into this category. By dragging or inputting the variables into the *row*, *column* or *cell* part, users build their own table schema and restructure the dataset. The following example illustrates transforming the raw table in the dataset into a tidy form using the specification *(state), (year) => (crime)*.

**Example Input:** 

| State   | Year | Crime  |
| ------- | ---- | ------ |
| Alabama | 2004 | 4029.3 |
| Alabama | 2005 | 3900   |
| Alaska  | 2004 | 3370.9 |
| Alaska  | 2005 | 3615   |

**Example Output:**

|         | 2004   | 2005 |
| ------- | ------ | ---- |
| Alabama | 4029.3 | 3900 |
| Alaska  | 3370.9 | 3615 |



### Transform Columns

**Definition:** Transform some column by exerting a mapping on each value in it.

**Illustration: ** ![transform-columns](.\pics\transform-columns.png)

**Example: **The *split* operation in Rigel meets the requirements, as it divides the values of some variable into some parts and take one segment as the result. (For the current version, this function is under development.) For example, consider a table including a list of addresses and corresponding owners. The address contains both the address type (Fax or Tel) and the number. The user only wants to keep the address type in the target table. So the user transforms the table by using the specification *(Name), () => (split(Number, ':')[0])*, as illustrated in the following input & output  table. Here *split(Number,':')[0]* means splitting the values of *Number* by ':' and take the substring with index *0* (i.e. the first part) as the result. For arbitrary mapping on column, more operations can be implemented into the system.

**Example Input:** 

| Name  | Number       |
| ----- | ------------ |
| Nile  | Fax:645-8397 |
| Jean  | Tel:637-2985 |
| Bach  | Fax:559-0178 |
| Peter | Tel:528-1132 |

**Example Output:**

|       | Split(Number, ':')[0] |
| ----- | --------------------- |
| Nile  | Fax                   |
| Jean  | Tel                   |
| Bach  | Fax                   |
| Peter | Tel                   |



### Transform Rows

**Definition:** Transform some row by exerting a mapping on each value in it.

**Illustration: ** ![transform-rows](.\pics\transform-rows.png)

**Example: ** Similar to *Transform Columns*, the operations that can be applied to a single column are also applicable to a row.



### Separate Tables - Subset

**Definition:** Divide tables row-wise into sub-tables.

**Illustration: ** ![separate-tables-subset](.\pics\separate-tables-subset.png)

**Example: ** As the output of such operations involve multiple tables, they are not directly implemented in current version of Rigel. Nevertheless, by using multiple specifications, Rigel still has the potential to handle this sort of transformation.  For example, the row-wise division can be seen as two filter operations, each leading to a new sub-table. Consider the tables given in example input. To divide the table, users can use specification *(filter(Name, 'Nile', 'Jean'), () => (Number))* and *(filter(Name, 'Bach', 'Peter'), () => (Number))* to derive two sub-tables.

**Example Input:** 

| Name  | Number       |
| ----- | ------------ |
| Nile  | Fax:645-8397 |
| Jean  | Tel:637-2985 |
| Bach  | Fax:559-0178 |
| Peter | Tel:528-1132 |

**Example Output:**

|      | Number       |
| ---- | ------------ |
| Nile | Fax:645-8397 |
| Jean | Tel:637-2985 |

and

|       | Number       |
| ----- | ------------ |
| Bach  | Fax:559-0178 |
| Peter | Tel:528-1132 |



### Separate Tables - Decompose

**Definition:** Divide tables row-wise into sub-tables, each containing a single row.

**Illustration: ** ![separate-tables-decompose](.\pics\separate-tables-decompose.png)

**Example: ** Similar to *Separate Tables - Subset*, this sort of transformation can also be viewed as a sequence of *filter* operations. As a result, Rigel can still potentially support such transformation.



### Separate Tables - Split

**Definition:** Divide tables column-wise into sub-tables.

**Illustration: ** ![separate-tables-decompose](.\pics\separate-tables-decompose.png)

**Example: ** Similar to *Separate Tables - Subset*, this sort of transformation can also be viewed as a sequence of *filter* operations. The only distinction lies in the target of *filter* operation shifts from variables in *row* to *cell* part of the specification.



### Separate Columns

**Definition:** Decompose a column into new variables.

**Illustration: ** ![separate-columns](.\pics\separate-columns.png)

**Example: ** In Rigel, decomposing columns into multiple variables can be viewed as a combination of multiple operations, where each operation derives a new variable based on the original column and inserts the result into the corresponding *row* or *column* part of the specification. Consider the table including a list of addresses and corresponding owners mentioned above. When the user wants to divide the *Number* field into address type and address number, he/she can simply use the *split* operation twice to derive variables representing the left and right part of *Number*. Then he inserts the two variables into *column* part of the specification, deriving the specification *(Name), () => (Split(Number, ':')[0] + Split(Number, ':')[1])*. The example is illustrated as follows.

**Example Input:** 

| Name  | Number       |
| ----- | ------------ |
| Nile  | Fax:645-8397 |
| Jean  | Tel:637-2985 |
| Bach  | Fax:559-0178 |
| Peter | Tel:528-1132 |

**Example Output:**

|       | Split(Number, ':')[0] | Split(Number, ':')[1] |
| ----- | --------------------- | --------------------- |
| Nile  | Fax                   | 645-8397              |
| Jean  | Tel                   | 637-2985              |
| Bach  | Fax                   | 559-0178              |
| Peter | Tel                   | 528-1132              |



### Separate Rows

**Definition:** Decompose a row into new variables.

**Illustration: ** ![separate-rows](.\pics\separate-rows.png)

**Example: ** Similar to *Separate Columns*, Rigel supports this type of operations well.



### Combine Tables - Extend

**Definition:** Union two tables row-wise into a new table.

**Illustration: ** ![combine-tables-extend](.\pics\combine-tables-extend.png)

**Example: ** Because concatenating two tables row-wise may ruin the schemas of the base tables, users are not encouraged to perform such operations in Rigel, since Rigel focuses on high-level transformations and is aimed to generate more meaningful target tables. However, for some simple cases, Rigel is still able to derive the target result. The *union* operation in Rigel supports the combination of tables based on a merge of multiple variables. (For current version, this operation is under development.) For example, given two original tables with specification *(state_1), (year_1) => (crime_1)* and *(state_2), (year_2) => (crime_2)*, the user can merge two tables row-wise by using specification *(union(state_1, state_2)), (union(year_1, year_2)) => (union(crime_1, crime_2))*.  

**Example Input:** 

| Name | Number       |
| ---- | ------------ |
| Nile | Fax:645-8397 |
| Jean | Tel:637-2985 |

and

| Name  | Number       |
| ----- | ------------ |
| Bach  | Fax:559-0178 |
| Peter | Tel:528-1132 |

**Example Output:**

|       | Number       |
| ----- | ------------ |
| Nile  | Fax:645-8397 |
| Jean  | Tel:637-2985 |
| Bach  | Fax:559-0178 |
| Peter | Tel:528-1132 |



### Combine Tables - Supplement

**Definition:** Join tables column-wise based on values in some key column. The relationship between the key columns is bijective.

**Illustration: ** ![combine-tables-supplement](.\pics\combine-tables-supplement.png)

**Example: ** When the *union* operation in Rigel is exerted on the key column, two tables can be merged based on the corresponding values in the key column. (For current version, this operation is under development.) For example, given two tables indicating the relationship between states and GDP or crime rate respectively, the user can combine these tables and put the three variables in a single table by taking *state* as the key column. Specifically, let the specification of base tables be *(state_1), () => (GDP)* and *(state_2), () => (crime)*, the target specification will be *(union(state_1, state_2)), () => (GDP + crime)*.

**Example Input:** 

| State_1 | GDP     |
| ------- | ------- |
| Alabama | 10044.5 |
| Alaska  | 8897.3  |

and

| State_2    | Crime  |
| ---------- | ------ |
| Alabama    | 3933.5 |
| New Jersey | 3507.1 |

**Example Output:**

|         | GDP     | Crime  |
| ------- | ------- | ------ |
| Alabama | 10044.5 | 3933.5 |
| Alaska  | 8897.3  | 3507.1 |



### Combine Tables - Match

**Definition:** Join tables column-wise based on values in some key column. The relationship between the key columns is injective.

**Illustration: ** ![combine-tables-match](.\pics\combine-tables-match.png)

**Example: ** When the *intersection* operation in Rigel is exerted on the key column, two tables can be merged based on the intersection of corresponding values in the key column. (For current version, this operation is under development.) For example, given two tables indicating the relationship between states and GDP or crime rate respectively and the states are not exactly equal, the user can combine these tables, including states that exist in both tables and corresponding GDP or crime. Specifically, let the specification of base tables be *(state_1), () => (GDP)* and *(state_2), () => (crime)*, the target specification will be *(intersection(state_1, state_2)), () => (GDP + crime)*.

**Example Input:** 

| State_1 | GDP     |
| ------- | ------- |
| Alabama | 10044.5 |
| Alaska  | 8897.3  |

and

| State_2    | Crime  |
| ---------- | ------ |
| Alabama    | 3933.5 |
| New Jersey | 3507.1 |

**Example Output:**

|         | GDP     | Crime  |
| ------- | ------- | ------ |
| Alabama | 10044.5 | 3933.5 |



### Combine Columns

**Definition:** Derive a new column based on multiple columns in a single table. 

**Illustration: ** ![combine-columns](.\pics\combine-columns.png)

**Example: ** In Rigel, *Concat* is an operation to perform a concatenation of values from multiple columns. For example, a user wants to combine the address type field and address number field in the same table to derive a new field. One specification meeting the requirements can be *(Name), () => (Concat(Type, Number))*.

**Example Input:** 

| Name  | Type | Number   |
| ----- | ---- | -------- |
| Niles | Fax  | 800-6423 |
| John  | Tel  | 635-5579 |
| Peter | Fax  | 587-1002 |

**Example Output:**

|       | Concat(Type, Number) |
| ----- | -------------------- |
| Niles | Fax800-6423          |
| John  | Tel635-5579          |
| Peter | Fax587-1002          |



### Combine Rows

**Definition:** Combine multiple rows by using an aggregation function on some variable grouped by another variable.

**Illustration: ** ![combine-rows-summarize](.\pics\combine-rows-summarize.png)

**Example: ** In Rigel, plenty of frequently used aggregation functions are provided, such as *sum*, *average* and *count*. Take *sum* as an example. A user wants to know the total crime rates over a fixed set of years for each state. One valid specification would be *(state), (), (sum(crime))*.

**Example Input:** 

| State   | Year | Crime  |
| ------- | ---- | ------ |
| Alabama | 2004 | 4029.3 |
| Alabama | 2005 | 3900   |
| Alaska  | 2004 | 3370.9 |
| Alaska  | 2005 | 3615   |

**Example Output:**

|         | sum(Crime) |
| ------- | ---------- |
| Alabama | 7929.3     |
| Alaska  | 7985.9     |



## References

[1] S. Kasica, C. Berret, and T. Munzner. Table Scraps: An Actionable Framework for Multi-Table Data Wrangling From An Artifact Study of Computational Journalism.
