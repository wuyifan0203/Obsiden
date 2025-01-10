# git checkout && git switch && git restore

Git 2.23 版本引入了 git switch 和 git restore 命令，目的是将 **git checkout 的功能拆分** 为更专注的命令，以提高可读性和易用性。

## git checkout

- 切换分支：

```bash
git checkout <分支名>
```

- 创建并切换分支：

```bash
git checkout -b <新分支名>
```

- 从远端分支创建并切换：

```bash
git checkout -b <本地分支名> <远端分支名>
```

- 恢复工作目录中的文件：

```bash
git checkout -- <文件名>
```

- 恢复文件到某个提交的状态：

```bash
git checkout <提交哈希> -- <文件名>
```

- 切换到某个提交（进入分离头指针状态）：

```bash
git checkout <提交哈希>
```

## git switch

- 切换分支：

```bash
git switch <分支名>
```

- 创建并切换分支：

```bash
git switch -c <新分支名>
```

- 从远端分支创建并切换：

```bash
git switch -c <本地分支名> <远端分支名>
```

- 切换到某个提交（进入分离头指针状态）：

```bash
git switch --detach <提交哈希>
```

## git restore

- 恢复工作目录中的文件

如果你在工作目录中修改了文件，但想撤销这些修改并恢复到上一次提交的状态，

```bash
git restore <文件名>
// 例如
git restore file.txt
```

- 恢复暂存区中的文件

如果你已经将文件添加到暂存区（使用 git add），但想将其从暂存区移除并保留工作目录中的修改，

```bash
git restore --staged <文件名>
// 例如
git restore --staged file.txt
```

- 同时恢复工作目录和暂存区

如果同时恢复工作目录和暂存区中的文件状态，可以使用

```bash
git restore --staged --worktree <文件名>
// 例如
git restore --staged --worktree file.txt
```

- 恢复到某个提交的文件状态

如果将文件恢复到某个特定提交的状态，可以使用

```bash
git restore --source=<提交哈希> <文件名>
// 例如
git restore --source=abcd1234 file.txt
```

- 恢复整个工作目录

如果想恢复整个工作目录中的所有文件到最近一次提交的状态，可以使用：

```bash
git restore .
```

- 恢复整个暂存区

如果想将暂存区中的所有文件移除（取消暂存），可以使用：

```bash
git restore --staged .
```

- 恢复文件到合并前的状态

如果在合并冲突时想放弃对某个文件的修改，恢复到合并前的状态，可以使用：

```bash
git restore --merge <文件名>
// 例如
git restore --merge file.txt
```

- 恢复文件到冲突解决前的状态

如果在解决冲突时想放弃对某个文件的修改，恢复到冲突解决前的状态，可以使用：

```bash
git restore --conflict <文件名>
// 例如
git restore --conflict file.txt
```

## 总结

| 功能                         | `git switch` | `git checkout` | `git restore` |
| ---------------------------- | ------------ | -------------- | ------------- |
| 切换分支                     | ✅           | ✅             | ❌            |
| 创建并切换分支               | ✅           | ✅             | ❌            |
| 从远端分支创建并切换         | ✅           | ✅             | ❌            |
| 恢复文件                     | ❌           | ✅             | ✅            |
| 切换到某个提交（分离头指针） | ✅           | ✅             | ❌            |
| 语义清晰性                   | 高           | 低             | 高            |

说明

- ✅ 表示支持该功能。

- ❌ 表示不支持该功能。

- 推荐：在 Git 2.23 及以上版本中，优先使用 git switch 和 git restore，以提高命令的语义清晰性和可读性。
