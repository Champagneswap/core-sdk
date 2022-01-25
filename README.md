# ChampagneSwap SDK Monorepo

## Prerequisites

- Yarn v3 (If unfamilair consult https://yarnpkg.com/getting-started/install to get started and familiarise yourself)
- Node v14 and above

## Versioning (Canary)

yarn lerna version --no-changelog --no-git-tag-version --preid canary --yes

## Publishing (Canary)

yarn run lerna publish from-package --dist-tag canary --no-git-reset --no-verify-access --preid canary --yes

## Core SDK

### Testing

```sh 
yarn workspace @champagneswap/core-sdk test
```

### Build

```sh 
yarn workspace @champagneswap/core-sdk build
```

## Limit Order SDK

### Testing

```sh 
yarn workspace @champagneswap/limit-order-sdk test
```

### Build

```sh 
yarn workspace @champagneswap/limit-order-sdk build
```

## Trident SDK

### Testing

```sh 
yarn workspace @champagneswap/spray-sdk test
```

### Build

```sh 
yarn workspace @champagneswap/spray-sdk build
```

## Tines SDK

### Testing

```sh 
yarn workspace @champagneswap/castle test
```

### Build

```sh 
yarn workspace @champagneswap/castle build
```