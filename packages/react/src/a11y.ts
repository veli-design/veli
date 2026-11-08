import * as React from 'react';

type AccessibleNameProps = {
  'aria-label'?: string | null;
  'aria-labelledby'?: string | null;
};

type ImportMetaWithEnv = ImportMeta & {
  env?: {
    DEV?: boolean;
    MODE?: string;
    NODE_ENV?: string;
  };
};

type GlobalWithProcess = typeof globalThis & {
  process?: {
    env?: {
      NODE_ENV?: string;
    };
  };
};

type ReactElementProps = {
  children?: React.ReactNode;
  'aria-hidden'?: boolean | 'true' | 'false';
};

export function normalizeAccessibleText(value: string | null | undefined) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized ? normalized : undefined;
}

export function hasAccessibleName(props: AccessibleNameProps) {
  return Boolean(
    normalizeAccessibleText(props['aria-label']) ||
    normalizeAccessibleText(props['aria-labelledby']),
  );
}

export function getTextFromReactNode(node: React.ReactNode) {
  const text = collectTextFromReactNode(node).join(' ');
  return normalizeAccessibleText(text);
}

export function invariantDev(condition: unknown, message: string) {
  if (!condition && isDevelopment()) {
    throw new Error(message);
  }
}

export function warnDev(condition: unknown, message: string) {
  if (!condition && isDevelopment()) {
    console.warn(message);
  }
}

export function isDevelopment() {
  const env = (import.meta as ImportMetaWithEnv).env;

  if (typeof env?.DEV === 'boolean') {
    return env.DEV;
  }

  if (env?.MODE) {
    return env.MODE !== 'production';
  }

  if (env?.NODE_ENV) {
    return env.NODE_ENV !== 'production';
  }

  const nodeEnv = (globalThis as GlobalWithProcess).process?.env?.NODE_ENV;

  if (nodeEnv) {
    return nodeEnv !== 'production';
  }

  return false;
}

function collectTextFromReactNode(node: React.ReactNode): string[] {
  if (node == null || typeof node === 'boolean') {
    return [];
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return [String(node)];
  }

  if (Array.isArray(node)) {
    return node.flatMap((child) => collectTextFromReactNode(child));
  }

  if (React.isValidElement(node)) {
    const props = node.props as ReactElementProps;

    if (props['aria-hidden'] === true || props['aria-hidden'] === 'true') {
      return [];
    }

    return collectTextFromReactNode(props.children);
  }

  if (isIterable(node)) {
    return Array.from(node).flatMap((child) => collectTextFromReactNode(child));
  }

  return [];
}

function isIterable(value: unknown): value is Iterable<React.ReactNode> {
  return typeof value === 'object' && value !== null && Symbol.iterator in value;
}
