import sys, json, difflib, builtins
import town


class OutOfOps(Exception):
    pass


_ops = [0]
_budget = [300]
_stage = [1]
_ns = {}
TANK_TOOLS = ['tank_level', 'tank_store', 'tank_take']


def _local(frame, event, arg):
    if event == 'line':
        _ops[0] += 1
        if _ops[0] > _budget[0]:
            raise OutOfOps()
    return _local


def _glob(frame, event, arg):
    if frame.f_code.co_filename == '<player>':
        return _local
    return None


def _locked(*a, **k):
    raise RuntimeError("sorted() is locked in 1950. You'll invent sorting yourself in the 1960s. Find another way for now.")


def _house(h):
    if not isinstance(h, int) or isinstance(h, bool):
        raise TypeError(f"A house number must be a whole number, not {h!r}.")
    n = int(town.houses())
    if h < 0 or h >= n:
        raise IndexError(f"There's no house {h}. Houses are numbered 0 to {n - 1}.")
    return h


def _amount(n):
    if not isinstance(n, int) or isinstance(n, bool):
        raise TypeError(f"Buckets must be a whole number, not {n!r}.")
    if n < 0:
        raise ValueError("You can't deliver a negative number of buckets.")
    return n


def houses():
    return int(town.houses())


def need(h):
    return int(town.need(_house(h)))


def deliver(h, n):
    return int(town.deliver(_house(h), _amount(n)))


def well_left():
    return int(town.well_left())


def tank_level():
    return int(town.tank_level())


def tank_store(n):
    return int(town.tank_store(_amount(n)))


def tank_take(n):
    return int(town.tank_take(_amount(n)))


def _print(*args, sep=' ', end='\n', **k):
    town.log(sep.join(str(a) for a in args))


_TOOLS = {
    1: ['houses', 'need', 'deliver', 'well_left'],
    2: ['houses', 'need', 'deliver', 'well_left'],
    3: ['houses', 'need', 'deliver', 'well_left'] + TANK_TOOLS,
}


def _fmt(e):
    line = None
    if isinstance(e, SyntaxError) and e.filename == '<player>':
        line = e.lineno
    tb = e.__traceback__
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == '<player>':
            line = tb.tb_lineno
        tb = tb.tb_next
    msg = f"{type(e).__name__}: {e}"
    hint = ''
    if isinstance(e, OutOfOps):
        msg = f"Out of ops: your code took more than {_budget[0]} steps today."
        hint = "Is there a loop that never stops?"
    elif isinstance(e, SyntaxError):
        msg = f"{type(e).__name__}: {e.msg}"
        hint = "Check the colon at the end of def / for / if / while lines, your brackets, and the indentation."
    elif isinstance(e, NameError):
        name = getattr(e, 'name', None)
        if not name and "'" in str(e):
            name = str(e).split("'")[1]
        if name in TANK_TOOLS:
            hint = "The village doesn't have a tank yet."
        else:
            pool = [k for k in _ns.keys() if not k.startswith('__')] + dir(builtins)
            m = difflib.get_close_matches(name or '', pool, n=1)
            if m:
                hint = f"Did you mean {m[0]}?"
            else:
                hint = "Python doesn't know this name. Did you create it before using it?"
    elif isinstance(e, TypeError):
        hint = "Check what you're passing to the function, and how many values."
    elif isinstance(e, ZeroDivisionError):
        hint = "Something was divided by zero."
    return json.dumps({'ok': False, 'msg': msg, 'line': line, 'hint': hint, 'ops': _ops[0]})


def _load(src, stage, budget):
    global _ns
    _budget[0] = budget
    _stage[0] = stage
    b = dict(vars(builtins))
    b['sorted'] = _locked
    b['print'] = _print
    b['input'] = None
    ns = {'__builtins__': b, '__name__': 'player'}
    for t in _TOOLS[stage]:
        ns[t] = globals()[t]
    _ns = ns
    try:
        code = compile(src, '<player>', 'exec')
        _ops[0] = 0
        sys.settrace(_glob)
        try:
            exec(code, ns)
        finally:
            sys.settrace(None)
    except BaseException as e:
        return _fmt(e)
    if not callable(ns.get('run_day')):
        return json.dumps({'ok': False, 'msg': "I can't find run_day().", 'line': None,
                           'hint': 'Your daily plan goes inside a function: def run_day():', 'ops': 0})
    return json.dumps({'ok': True})


def _day():
    _ops[0] = 0
    try:
        sys.settrace(_glob)
        try:
            _ns['run_day']()
        finally:
            sys.settrace(None)
    except BaseException as e:
        return _fmt(e)
    return json.dumps({'ok': True, 'ops': _ops[0]})
