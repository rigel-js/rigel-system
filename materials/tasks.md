# Appendix -  Tasks for user study

Here we list the tasks we use in our user study. 

- [Appendix -  Tasks for user study](#appendix----tasks-for-user-study)
  - [Task 1](#task-1)
    - [Description](#description)
    - [Input](#input)
    - [Sample Output](#sample-output)
  - [Task 2](#task-2)
    - [Description](#description-1)
    - [Input](#input-1)
    - [Sample Output](#sample-output-1)
  - [Task 3](#task-3)
    - [Description](#description-2)
    - [Input](#input-2)
    - [Sample Output](#sample-output-2)
  - [Task 4](#task-4)
    - [Description](#description-3)
    - [Input](#input-3)
    - [Sample Output](#sample-output-3)

## Task 1

### Description

Transform the input data into a table with one paper and all its authors per row. All authors should be placed into a cell and separate each author with a comma.

### Input

| Paper                                                        | Author               |
| ------------------------------------------------------------ | -------------------- |
| D3 data-driven documents                                     | Michael Bostock      |
| D3 data-driven documents                                     | Vadim Ogievetsky     |
| D3 data-driven documents                                     | Jeffrey Heer         |
| Lyra: An interactive  visualization design environment       | Arvind Satyanarayan  |
| Lyra: An interactive  visualization design environment       | Jeffrey Heer         |
| Reactive vega: A streaming  dataflow architecture for declarative interactive visualization | Arvind Satyanarayan  |
| Reactive vega: A streaming  dataflow architecture for declarative interactive visualization | Ryan Russell         |
| Reactive vega: A streaming  dataflow architecture for declarative interactive visualization | Jane Hoffswell       |
| Reactive vega: A streaming  dataflow architecture for declarative interactive visualization | Jeffrey Heer         |
| Vega-lite: A grammar of  interactive graphics                | Arvind Satyanarayan  |
| Vega-lite: A grammar of  interactive graphics                | Dominik Moritz       |
| Vega-lite: A grammar of  interactive graphics                | Kanit Wongsuphasawat |
| Vega-lite: A grammar of  interactive graphics                | Jeffrey Heer         |

### Sample Output

| Paper                                                        | Author                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| D3 data-driven documents                                     | Michael Bostock,Vadim Ogievetsky,Jeffrey Heer,               |
| Lyra: An interactive  visualization design environment       | Arvind Satyanarayan,Jeffrey Heer,,                           |
| Reactive vega: A streaming  dataflow architecture for declarative interactive visualization | Arvind Satyanarayan,Ryan Russell,Jane Hoffswell,Jeffrey Heer |
| Vega-lite: A grammar of  interactive graphics                | Arvind Satyanarayan,Dominik Moritz,Kanit  Wongsuphasawat,Jeffrey Heer |



## Task 2

### Description

Generate a unique key for each row and place the key in the  last cell of each row.

### Input

| State                | Year | Crime rate |
| -------------------- | ---- | ---------- |
| Alabama              | 2004 | 4029.3     |
| Alabama              | 2005 | 3900       |
| Alabama              | 2006 | 3937       |
| Alabama              | 2007 | 3974.9     |
| Alabama              | 2008 | 4081.9     |
| District of Columbia | 2004 | 4852.8     |
| District of Columbia | 2005 | 4490       |
| District of Columbia | 2006 | 4653.9     |
| District of Columbia | 2007 | 4916.3     |
| District of Columbia | 2008 | 5104.6     |
| California           | 2004 | 3423.9     |
| California           | 2005 | 3321       |
| California           | 2006 | 3175.2     |
| California           | 2007 | 3032.6     |
| California           | 2008 | 2940.3     |
| New Jersey           | 2004 | 2433       |
| New Jersey           | 2005 | 2337       |
| New Jersey           | 2006 | 2278.4     |
| New Jersey           | 2007 | 2205.5     |
| New Jersey           | 2008 | 2293.4     |

### Sample Output

| State                | Year | Crime rate | Key                      |
| -------------------- | ---- | ---------- | ------------------------ |
| Alabama              | 2004 | 4029.3     | Alabama2004              |
| Alabama              | 2005 | 3900       | Alabama2005              |
| Alabama              | 2006 | 3937       | Alabama2006              |
| Alabama              | 2007 | 3974.9     | Alabama2007              |
| Alabama              | 2008 | 4081.9     | Alabama2008              |
| District of Columbia | 2004 | 4852.8     | District of Columbia2004 |
| District of Columbia | 2005 | 4490       | District of Columbia2005 |
| District of Columbia | 2006 | 4653.9     | District of Columbia2006 |
| District of Columbia | 2007 | 4916.3     | District of Columbia2007 |
| District of Columbia | 2008 | 5104.6     | District of Columbia2008 |
| California           | 2004 | 3423.9     | California2004           |
| California           | 2005 | 3321       | California2005           |
| California           | 2006 | 3175.2     | California2006           |
| California           | 2007 | 3032.6     | California2007           |
| California           | 2008 | 2940.3     | California2008           |
| New Jersey           | 2004 | 2433       | New Jersey2004           |
| New Jersey           | 2005 | 2337       | New Jersey2005           |
| New Jersey           | 2006 | 2278.4     | New Jersey2006           |
| New Jersey           | 2007 | 2205.5     | New Jersey2007           |
| New Jersey           | 2008 | 2293.4     | New Jersey2008           |



## Task 3

### Description

Remove invalid numbers without type, and create a  cross-tabulation using Name, Number Type and Number.

### Input

| Name     | Type | Number        | Usage |
| -------- | ---- | ------------- | ----- |
| Niles C. | Tel  | (800)645-8397 | home  |
| Niles C. | Tel  | (800)645-8398 | work  |
| Niles C. | Fax  | (907)586-7252 | work  |
| Jean H.  | Tel  | (918)781-4600 | home  |
| Jean H.  | Tel  | (918)781-4601 | work  |
| Jean H.  | Fax  | (918)781-4603 | home  |
| Jean H.  | Fax  | (918)781-4604 | work  |
| Bach J.  |      | 781-4605      | work  |
| Bach J.  |      | (918)781-4604 | work  |

### Sample Output

|      |      | Niles C.      | Jean H.       |
| ---- | ---- | ------------- | ------------- |
| Tel  | home | (800)645-8397 | (918)781-4600 |
| Tel  | work | (800)645-8398 | (918)781-4601 |
| Fax  | home |               | (918)781-4603 |
| Fax  | work | (907)586-7252 | (918)781-4604 |



## Task 4

### Description

Transpose the table.

### Input

| State                | Year | Crime rate |
| -------------------- | ---- | ---------- |
| Alabama              | 2004 | 4029.3     |
| Alabama              | 2005 | 3900       |
| Alabama              | 2006 | 3937       |
| Alabama              | 2007 | 3974.9     |
| Alabama              | 2008 | 4081.9     |
| District of Columbia | 2004 | 4852.8     |
| District of Columbia | 2005 | 4490       |
| District of Columbia | 2006 | 4653.9     |
| District of Columbia | 2007 | 4916.3     |
| District of Columbia | 2008 | 5104.6     |
| California           | 2004 | 3423.9     |
| California           | 2005 | 3321       |
| California           | 2006 | 3175.2     |
| California           | 2007 | 3032.6     |
| California           | 2008 | 2940.3     |
| New Jersey           | 2004 | 2433       |
| New Jersey           | 2005 | 2337       |
| New Jersey           | 2006 | 2278.4     |
| New Jersey           | 2007 | 2205.5     |
| New Jersey           | 2008 | 2293.4     |

### Sample Output

| Alabama | Alabama | Alabama | Alabama | Alabama | District of Columbia | District of Columbia | District of Columbia | District of Columbia | District of Columbia | California | California | California | California | California | New Jersey | New Jersey | New Jersey | New Jersey | New Jersey |
| ------- | ------- | ------- | ------- | ------- | -------------------- | -------------------- | -------------------- | -------------------- | -------------------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- |
| 2004    | 2005    | 2006    | 2007    | 2008    | 2004                 | 2005                 | 2006                 | 2007                 | 2008                 | 2004       | 2005       | 2006       | 2007       | 2008       | 2004       | 2005       | 2006       | 2007       | 2008       |
| 4029.3  | 3900    | 3937    | 3974.9  | 4081.9  | 4852.8               | 4490                 | 4653.9               | 4916.3               | 5104.6               | 3423.9     | 3321       | 3175.2     | 3032.6     | 2940.3     | 2433       | 2337       | 2278.4     | 2205.5     | 2293.4     |