# useTable

Support for an alternative POST request

````md
```js{4}
import {BasicTableProps, useTable} from 'xlm-use'
const state: BasicTableProps = reactive<BasicTableProps>{
    queryForm:{},
    pageList: fetchList
}

const {getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle} = useTable(state)
```
````