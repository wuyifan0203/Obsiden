## Shell 环境

Shell 编程跟 JavaScript、php 编程一样，只要有一个能编写代码的文本编辑器和一个能解释执行的脚本解释器就可以了。

Linux 的 Shell 种类众多，常见的有：

- Bourne Shell（/usr/bin/sh或/bin/sh）
- Bourne Again Shell（/bin/bash）
- C Shell（/usr/bin/csh）
- K Shell（/usr/bin/ksh）


Bash 也是大多数Linux 系统默认的 Shell。

在一般情况下，人们并不区分 Bourne Shell 和 Bourne Again Shell，所以，像 **#!/bin/sh**，它同样也可以改为 **#!/bin/bash**。

`#!` 告诉系统其后路径所指定的程序即是解释此脚本文件的 Shell 程序。

## Shell 执行

```shell
chmod +x ./test.sh  #使脚本具有执行权限
./test.sh  #执行脚本

# 另一种方式 直接运行解释器，其参数就是 shell 脚本的文件名
/bin/sh test.sh
```

## Shell 变量

### 变量声明

注意：变量名和等号之间不能有空格，

```shell
your_name="wyf"
```

### 变量使用

使用`$变量名`,或者使用 `${变量名}`，使用 `{}` 是为了区分变量的边界

```shell
echo $your_name # wyf

echo "Your name is ${your_name}" # Your name is wyf
```

### 常量声明

使用 `readonly` 修饰的变量将不可改变，如果改变，则会报错

```shell
readonly my_name="wyz"

echo my_name # wyz

my_name="666" # my_name: readonly variable \n Exited with error status 1
```

### 删除变量

使用 `unset` 命令可以删除变量, 变量被删除后不能再次使用。unset 命令不能删除只读变量

```shell
her_name="ljx"  

unset her_name  # 这里不需要加$

echo $her_name  #   (无任何输出)
```

### shell 字符串

使用单引号和双引号都可以

#### 使用单引号

- 单引号里的任意字符都会原样输出

#### 使用双引号

```shell
my_name="wyz"

str="Hellow, my name is \"$my_name\" !"

echo -e $str
```

优点
- 可以在内部使用变量
- 可以使用转义字符

```shell
your_name="wyf"
# 使用双引号拼接
greeting="hello, "$your_name" !"
greeting_1="hello, ${your_name} !"

echo $greeting  $greeting_1 

# hello, runoob ! hello, runoob !

# 使用单引号拼接
greeting_2='hello, '$your_name' !'
greeting_3='hello, ${your_name} !'

echo $greeting_2  $greeting_3

# hello, runoob ! hello, ${your_name} !
```

### 获取字符串长度

使用  `${#变量名}` , 等价于 `${#string[0]}`

```shell
string="abcd"

echo ${#string}   # 输出 4

echo ${#string[0]}  # 输出 4

```

### 截取字符串

使用`${变量名:起始索引:结束索引}` 截取字符

```shell
string="runoob is a great site"

echo ${string:1:4} # 输出 unoo
```
