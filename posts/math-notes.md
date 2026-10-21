---
title: 数学公式
date: 2026-10-20
category: 技术探索
tags: [demo]
description: 从行内公式到矩阵与多行推导，用简洁的 LaTeX 语法，清楚表达那些值得记录的数学想法。
---
## 行内公式

用一对美元符号包裹公式。例如，质能关系 $E = mc^2$，勾股定理 $a^2 + b^2 = c^2$，以及欧拉恒等式 $e^{i\pi} + 1 = 0$。

```latex
质能关系 $E = mc^2$
```

## 独立公式

用两对美元符号将公式单独放在一个段落中。下面是正态分布的概率密度函数：

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}}
\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)
$$

### 求和与积分

$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
\qquad
\int_0^1 x^2\,\mathrm{d}x = \frac{1}{3}
$$

## 矩阵与多行推导

矩阵可以使用 `bmatrix` 环境：

$$
A = \begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
\qquad \det(A) = 1\cdot4 - 2\cdot3 = -2
$$

多行公式使用 `aligned` 环境，通过 `&` 对齐：

$$
\begin{aligned}
(a+b)^2 &= (a+b)(a+b) \\
&= a^2 + 2ab + b^2
\end{aligned}
$$

## 分段函数

$$
|x| = \begin{cases}
x, & x \ge 0 \\
-x, & x < 0
\end{cases}
$$

## 写作小提示

- 普通美元符号可以写为 `\$`，如 \$20。
- 行内代码和代码块内的 `$...$` 保留原样，不会渲染。
- 长公式可以横向滚动，不会撑开手机页面。
- 公式在构建时生成，读者无需加载 JavaScript 即可阅读。
