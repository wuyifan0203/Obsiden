## 1、直接修改远程仓库地址

```git
git remote set-url origin <仓库地址>

# example

git remote set-url origin git@xxx.xxx.com:xxxx/xxx.git
```

## 2、修改.git文件夹下的config文件

将url替换，然后保存

```
// .git/config

[pull]
	rebase = true
[remote "origin"]
	url = git@xxx.xxx.com:xxxx.git // ->替换
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "testDev"]

```