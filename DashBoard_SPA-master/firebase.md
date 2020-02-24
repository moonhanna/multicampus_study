# 1.Firebase



## 1.1 설치방법

> 먼저 node.js를 다운 받고 npm install -g firebase-tools 를 cmd창에 입력해서 툴을 다운 받는다. 그 후 firebase를 사용할 폴더에서 teminal 창을연다. 그 후 firebase init을 이용해서 환경 설정을 시작한다. firestrore에서 기본적인 데이터 설정을 추가한다.

## 1. 2쿼리 입력

```javascript
db.collection("study").doc("test1").get().then(function (doc) {
    doc.data().status;
})
```





꿀팁: vscode 정렬키 : 컨트롤a 후 컨트롤+k+f

