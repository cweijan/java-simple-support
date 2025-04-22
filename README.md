# Java Simple Support

English | [中文](README.zh-CN.md)

A lightweight Java language support extension for Visual Studio Code, specifically designed for AI-powered editors like Cursor. It enhances code navigation capabilities without the complexity and overhead of a full LSP implementation, providing essential Java language features.

## Project Overview

This extension is designed to enhance code navigation capabilities in AI-powered editors like Cursor, without relying on heavy Java Language Server Protocol (LSP) implementations. It provides a lightweight alternative that focuses on essential Java language features while maintaining fast performance and low resource usage.

## Features

- **Outline View**

  - Display classes, methods, and fields in the outline view
  - Quick navigation through the document structure
  - Collapsible tree view for better code organization
  - Symbol filtering and search capabilities
- **Code Navigation**

  - Jump to symbol definitions within the current file
  - Basic symbol resolution
  - Go to declaration for methods and fields
  - Find all references within the current file
  - MyBatis Support
    - Quick navigation between Mapper interfaces and their corresponding XML files
    - Locate SQL statements in XML by method names
    - Navigate from XML SQL statements to corresponding interface methods
- **Code Completion**

  - Java keyword completion
  - Local symbol completion (classes, methods, fields)
  - Context-aware suggestions
  - Basic type inference support
  - Import statement completion
