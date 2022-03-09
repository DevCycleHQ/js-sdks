# Adding a new library

Use Nx to generate a new library:
`nx workspace-generator library <libraryName>`

eg.

`nx workspace-generator library nest/logging`

The top-level folders inside `lib/` indicate where the library is intended to be used:
```
lib/
  shared/       - libraries that work in any JS project
```

We are loosely following the advice in these articles for organizing our libraries
https://nx.dev/l/n/structure/grouping-libraries
https://medium.com/showpad-engineering/how-to-organize-and-name-applications-and-libraries-in-an-nx-monorepo-for-immediate-team-wide-9876510dbe28
