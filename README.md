# Developer Notes
当前版本的一些limitations:

- 一次只导入一张表，多张表的情况留坑
- 不考虑用户往单元格里输入属性名称的情况，例如输入crime或bin(crime)，推荐系统将不予匹配
- 不考虑matching不到的情况，假设用户输入的数据一定能成功匹配
- 对于匹配的情形，先只考虑只有1个attr和该value匹配的情况

---

现在要改的（优先级1）
- ~~[ ] suggestion 更新 template spec，进而 trigger 下一轮 suggestion（比较重要！）~~
- ~~[ ] bin 的默认 step 改成 5~~
- ~~[ ] operate 生成的新属性，参数填的不准确，table.attribute~~
- ~~[ ] template 的 column header 换行问题~~
- ~~[ ] 页面弄成单个整页，不要有全局滚动，有局部滚动就可以了~~
- ~~[ ] template 里，reset 之后，再次拖拽 bug~~
- ~~[ ] cross 改成 x~~

---

一些新问题（优先级1）
- ~~[ ] 滚动问题（见上面的第五条），Target Table 里应该有两个局部滚动，分别是电子表格和下面的 spec template，这两个不应该混成一个~~
- [ ] 同样的滚动问题，suggestion 好像还不能滚动
- ~~[ ] spec template 的 apply 按钮，需要去掉，每次 input 框变化的时候自动 apply~~
- [ ] 优先级2中的第四条提上来，suggestion 的 UI 向设计稿看齐，hierarchy 进行组织（建议不要用 antd 的这个组件了）
- [ ] spec template 中的 hint 做一下（输入框右边空间不够可以放到输入框下边）

---

未来迭代的（优先级2）
- [ ] template 右键 operate 属性
- [ ] template 里，属性删除
- [ ] 顶格子的问题
- [ ] suggestion 里的 UI，向设计稿看齐（上提）


---

在研究一下怎么实现（优先级3）
- [ ] undo 和 redo，UI = f(state)，state 变化做成一个 stack
  a = 1
  b = 2 ( b_old = 1 )
  