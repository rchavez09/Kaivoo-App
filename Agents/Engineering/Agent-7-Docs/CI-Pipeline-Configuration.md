# CI Pipeline Configuration

**Source:** Extracted from Agent 7 Code Reviewer spec, Appendix A
**Parent:** [Agent-7-Code-Reviewer.md](../Agent-7-Code-Reviewer.md)

---

## Automated Checks (CI Integration)

```yaml
# .github/workflows/ci.yml — Agent 7 automated checks
- name: Lint
  run: npm run lint

- name: Type check
  run: npm run typecheck

- name: Format check
  run: npm run format:check

- name: Test
  run: npm run test

- name: Build
  run: npm run build

- name: Bundle size check
  run: |
    npm run build
    BUNDLE_SIZE=$(stat -f%z dist/assets/*.js | awk '{sum+=$1}END{print sum}')
    if [ $BUNDLE_SIZE -gt 524288 ]; then  # 512 KB uncompressed limit
      echo "::error::Bundle size exceeds limit: $BUNDLE_SIZE bytes"
      exit 1
    fi
```
