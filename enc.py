import sys
import base64

KEY = "doof"

arg = sys.argv[1]
xored = "".join(chr(ord(c) ^ ord(KEY[i % len(KEY)])) for i, c in enumerate(arg))
print(base64.b64encode(xored.encode("latin-1")).decode("ascii"))
