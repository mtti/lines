[![Written in TypeScript](https://flat.badgen.net/badge/icon/typescript?icon=typescript&label)](http://www.typescriptlang.org/) [![npm](https://flat.badgen.net/npm/v/@mtti/lines?icon=npm)](https://www.npmjs.com/package/@mtti/lines) [![License](https://flat.badgen.net/github/license/mtti/lines)](https://github.com/mtti/lines/blob/master/LICENSE)

Implements a *LineStream* class for splitting streaming text by line.

Based on [node-byline](https://github.com/jahewson/node-byline) hand-converted to modern TypeScript.

## Basic usage

```typescript
import fs from 'fs';
import { LineStream } from '@mtti/lines';

const input = fs.createReadStream('lorem-ipsum.txt');
const ls = new LineStream();

ls.on('data', (line) => {
    console.log(line);
});

input.pipe(ls);
```

## Features and quirks

* Can receive `Buffer` and `string`, outputs individual lines as `string`.
* Correctly handles Unicode multi-part strings and CRLF between chunks.
* Throws an error if:
    * anything other than a `Buffer` or `string` is received
    * encoding appears to change mid-stream, ie. if the encoding of any subsequent chunk doesn't match that of the first chunk

## License

```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

Based on [node-byline](https://github.com/jahewson/node-byline) by John Hewson and [contributors](https://github.com/jahewson/node-byline/graphs/contributors), licensed under the MIT license.

```
node-byline (C) 2011-2015 John Hewson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
````
