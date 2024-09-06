## save

```git
git stash save '备注信息'
```

只会保存track的文件，需要保存untrack文件需要在save 后加 - u
存放时添加备注便于查找，也可以不加，系统默认会加

## list

```git 
git stash list
```
查看存放列表

## show
```git 
git stash show
// example
git stash show stash@{0}
```
显示改动信息，默认展示第一个存储
如果要显示其它存储，后面加stash@{index}，比如第二个 `git stash show stash@{1}`, index从0开始

查看详细的文件内容差异，使用 `-p` 选项：
```git
git stash show -p stash@{0}
```


## pop
```git 
git stash pop
```
默认pop第一个，如果需要pop其他的，git stash pop stash@{index}

## apply
```git 
git stash apply
```
默认apply第一个，想apply其他的，`git stash apply stash@{index}`
`// git stash apply stash@{1}`

>`git stash pop` 与 `git stash apply`的区别：前者应用后会将其从存储列表中删除，而后者则不会

## drop
```git 
git stash drop stash@{index}
```

丢弃stash@{index}存储，从列表中删除某个存储

## clear
```git 
git stash clear
```

清除存储列表中的所有stash