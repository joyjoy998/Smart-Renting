## 必看

开始开发这个项目前,在根目录创建一个 .env.local 文件,然后把 colab 链接下边的这几个密钥放进文件里,但注意,它的值是加密过后的 byte 类型数据(byte 符号我去掉了,你只需要复制那个值就可以扔 第三个 code block 的那个 input 里就可以了),想要解密请通过以下 colab (记得按顺序运行第一第二个 code blcok 才能用第三个的 decrypt!)连接:
https://colab.research.google.com/drive/1cSRB_SN1F-dbkYD5U2-Oj9Kd69pM0baw?usp=sharing

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = gAAAAABneTtKrFpK7s83K3WVgp33QJkiP966eCy9S_OIZPnyd_DG-RcyIkbEZMc8LUQw5JRdcA2q8BAoM-5htsyKpePQ2g059osOuUm3Od477VUfVd-UyoQftD1hqh-M3aLuVFcxcTFA

NEXT_PUBLIC_GOOGLE_LIGHT_MAPS_ID = gAAAAABneN8D26VT6ndGXXUIpF3UD4rWsUOr558P8BbMjBYIMuRMcGBSZOVenZcyFHRFIm2BiIVfhmlhRyAz3Fdn4p6kqX623yIOj6pDM70aekROUsyf1jc=

NEXT_PUBLIC_GOOGLE_DARK_MAPS_ID = gAAAAABneN3Mqaqgf03MKNaPdDw-pqst8Z-qBAI-oT5YZVAjumqm3kCGp-OkpKIdc0eKvQemLU_Zz3CwLwKD\_\_jL4-aQGPGKbyxXpp-g6Ipg8bJDmjFrFMc=

之后在根目录的 terminal 运行命令 npm install ,把 node_modules 装好

接下来再运行命令 npm run dev ,就能够运行了

## 记得!!!所有人如果运行成功之后要在群里说一声,这个 MD 是要删掉的!!!
