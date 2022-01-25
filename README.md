# Developer Notes
当前版本的一些limitations:

- 一次只导入一张表，多张表的情况留坑
- 不考虑用户往单元格里输入属性名称的情况，例如输入crime或bin(crime)，推荐系统将不予匹配
- 不考虑matching不到的情况，假设用户输入的数据一定能成功匹配
- 对于匹配的情形，先只考虑只有1个attr和该value匹配的情况

---

现在要改的（优先级1）
- [ ] suggestion 更新 template spec，进而 trigger 下一轮 suggestion（比较重要！）
- ~~[ ] bin 的默认 step 改成 5
- ~~[ ] operate 生成的新属性，参数填的不准确，table.attribute
- ~~[ ] template 的 column header 换行问题
- ~~[ ] 页面弄成单个整页，不要有全局滚动，有局部滚动就可以了
- [ ] template 里，reset 之后，再次拖拽 bug
- ~~[ ] cross 改成 x

---

未来迭代的（优先级2）
- [ ] template 右键 operate 属性
- [ ] template 里，属性删除
- [ ] 顶格子的问题
- [ ] suggestion 里的 UI，向设计稿看齐


---

在研究一下怎么实现（优先级3）
- [ ] undo 和 redo，UI = f(state)，state 变化做成一个 stack
  a = 1
  b = 2 ( b_old = 1 )
  