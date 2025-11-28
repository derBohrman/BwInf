import sys
from time import time_ns

sys.set_int_max_str_digits(10000)


def comb(a, b, c):
    global n
    return a * (n ** 2) + b * n + c


def decomb(i):
    global n
    return i // (n ** 2), (i % (n ** 2)) // n, i % n


def recomb(i):
    global n
    return comb(*sorted(list(decomb(i))))


debug = False
months = 12
path = 'bauern2.txt'
g = []
rg = {}
start = time_ns()
with open(path, encoding='utf-8') as f:
    n = int(f.readline())
    for k in range(n):
        g.append(f.readline().rstrip())
        rg[g[-1]] = k
    d = [0 for _ in range(n ** 3 + 1)]
    m = int(f.readline())
    for k in range(m):
        a, b, c = tuple(f.readline().rstrip().split())
        a = int(rg[a])
        b = int(rg[b])
        c = int(rg[c])
        d[(n ** 2) * a + n * b + c] += 1
        d[(n ** 2) * a + n * c + b] += 1
        d[(n ** 2) * b + n * a + c] += 1
        d[(n ** 2) * b + n * c + a] += 1
        d[(n ** 2) * c + n * a + b] += 1
        d[(n ** 2) * c + n * b + a] += 1
dp = [[(0, set(), 0) for _ in range(n ** 3)] for _ in range(months + 1)]
for j in range(n ** 3):
    if d[j]:
        dp[1][j] = (d[j], {recomb(j)}, (j // (n ** 2), (j % (n ** 2)) // n))
for i in range(2, months - 1):
    for j in range(n ** 3):
        if dp[i - 1][j][0] == 0:
            continue
        if type(dp[i - 1][j][1]) is not set:
            print(type(dp[i - 1][j][1]), decomb(j))
            raise ValueError
        for k in range(n):
            b = (j % (n ** 2)) // n
            c = j % n
            if k == b or k == c:
                continue
            target = comb(b, c, k)
            rtarget = recomb(target)
            if dp[i][target][0] < dp[i - 1][j][0] + d[target] * (rtarget not in dp[i - 1][j][1]):
                dp[i][target] = (dp[i - 1][j][0] + d[target] * (rtarget not in dp[i - 1][j][1]),
                                 dp[i - 1][j][1].copy() | {rtarget}, dp[i - 1][j][2])

if debug:
    for i in range(len(dp[months - 2])):
        if dp[months - 2][i][0] == 10:
            print(decomb(i), dp[months - 2][i][0], *dp[months - 2][i][2])
            #print(bool(dp[months - 2][i][1] & (1 << recomb(comb(decomb(i)[1], decomb(i)[2], dp[months - 2][i][2][0])))),
            #      (decomb(recomb(comb(decomb(i)[1], decomb(i)[2], dp[months - 2][i][2][0])))))  # obsolete

for j in range(n ** 3):
    if dp[months - 2][j][0] == 0:
        continue
    oa, ob = dp[months - 2][j][2]
    ta, tb, tc = decomb(j)
    nt = comb(tb, tc, oa)
    rnt = recomb(nt)

    if debug:
        if dp[months - 2][j][0] == 10:
            print('a', decomb(j))
            print('b', decomb(rnt), decomb(nt))

    if dp[months - 1][nt][0] < dp[months - 2][j][0] + d[nt] * (rnt not in dp[months - 2][j][1]):
        dp[months - 1][nt] = (dp[months - 2][j][0] + d[nt] * (rnt not in dp[months - 2][j][1]),
                              dp[months - 2][j][1].copy() | {rnt}, dp[months - 2][j][2])
        nnt = comb(tc, oa, ob)
        rnnt = recomb(nnt)

        if dp[months][nnt][0] < dp[months - 1][nt][0] + d[nnt] * (rnnt not in dp[months - 1][nt][1]):
            dp[months][nnt] = (dp[months - 1][nt][0] + d[nnt] * (rnnt not in dp[months - 1][nt][1]),
                               dp[months - 1][nt][1].copy() | {rnnt}, dp[months - 1][nt][2])

print('Max. ' + str(max(i[0] for i in dp[months])) + ' dishes are cookable yearly')
print('Finished in ' + str((time_ns() - start) / 1e6) + ' ms')
