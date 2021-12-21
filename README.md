# Rigel-System

- ~~[ ] 拖拽 column，需要从交互的 cell 开始（不然交叉表没法做）~~
- ~~[ ] 拖拽 column，上边框好像不太敏感（想必左边框）~~ p.s 涉及到调个参，不满意的话后面再调
- ~~[ ] Relations -> Raw Tables~~
- [ ] Example Data，Crime 弄进去

# Developer Notes
当前版本的一些limitations:

- 一次只导入一张表，多张表的情况留坑
- 不考虑用户往单元格里输入属性名称的情况，例如输入crime或bin(crime)，推荐系统将不予匹配
- 不考虑matching不到的情况，假设用户输入的数据一定能成功匹配
- 对于匹配的情形，先只考虑只有1个attr和该value匹配的情况