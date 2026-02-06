# PR Checklist (Venna)

## Trust & correctness
- [ ] No guessing paths introduced
- [ ] Venue scoping enforced in all queries
- [ ] Confidence gate present and tested
- [ ] Escalation path works and logs

## Security
- [ ] No secrets shipped to client
- [ ] CORS locked down (widget origins)
- [ ] Rate limits applied to public endpoints
- [ ] Input validation for widget requests

## Performance
- [ ] Widget boot remains tiny; no heavy deps added
- [ ] No accidental bundle bloat in web/widget
- [ ] Dashboard routes avoid unnecessary client JS

## DX
- [ ] Tests added/updated
- [ ] Types pass
- [ ] Lint passes
