# Development guide

## Building locally

If you are not using Gitpod you need to install and build the project in order to use it.

Every project in this repo has a standard running interface.

All libraries have:

- write here

All services have:

- write here

## Committing and creating changelogs

Bumping major version number shouldn't be done unless there is a MR and Codeowner approved it.

When you start developing and if you add new changes to the public packages without the changelog the `test_build` job will fail. Add the changelog.

When you implement something worthy of a mention in the Changelog run the following script and do not bump the version until the very end! Then, make a final changelog with correct version bump. Add the links to fixed issues if possible. Check rushjs best practices on [how to write good changelogs](https://rushjs.io/pages/best_practices/change_logs/).

```sh
# write what is the change, and what is the proposed version change
rush change
```

## Publishing

If the Changelogs job fails then developer mst provide CHANGELOGS by running the `rush change` and answer the question.

The job `bump-versions` is automatically triggered for now. The `publish-packages` will only publish to anagolay registry automatically when the parent task is success

# Very useful commands:

```sh
# remove local tags that do not exist on the remote
git fetch --prune --prune-tags
```
