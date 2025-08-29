# SmartSignal Pro - Application & Prompt Guide

This document provides a detailed overview of the SmartSignal Pro application, its key features, and the core principles behind its main AI prompt.

## 1. Application Overview

**SmartSignal Pro** is a sophisticated trading analysis tool designed to provide traders with comprehensive, real-time, and AI-powered insights into financial markets, specifically focusing on crypto assets.

### Key Features:

*   **Quantum Analysis Engine:** Users can select a crypto asset (e.g., BTC), an analysis mode, and a timeframe to generate a detailed "Signal Card."
*   **Real-Time Price Feed:** The application uses a WebSocket connection to stream live price data from Binance, providing up-to-the-second market information.
*   **Comprehensive Signal Card:** The generated card includes a wealth of technical analysis data:
    *   Entry, Stop-Loss (SL), and Take-Profit (TP) levels.
    *   Risk/Reward (R/R) ratio.
    *   Multi-Timeframe Analysis (e.g., 15m, 1H, 4H, Daily).
    *   Chart pattern recognition.
    *   Key institutional levels like Supply/Demand zones and Fair Value Gaps (FVG).
    *   Volume analysis and Fibonacci retracement levels.
*   **AI-Powered Insight:** The "Elite Mode" leverages a powerful Genkit AI flow to synthesize all technical data and recent market news into a professional, high-level summary.
*   **Market Analysis Chatbot:** An AI-powered chatbot ("Cathy") is available to answer general market questions in multiple languages.
*   **User & Admin System:** A complete authentication system allows for user registration, login, and an admin dashboard for managing user access.

---

## 2. Core AI Prompt: The "Elite AI Insight"

The heart of the application's intelligence lies in the `generateAiInsight` Genkit flow. This prompt is designed to emulate a world-class institutional trading strategist.

### Key Prompt Components:

#### a. Persona & Objective

*   **Persona:** `ELITE-AI`, a world-class trading strategist with 20 years of institutional experience.
*   **Objective:** To analyze a complete trading setup and deliver a powerful, single-paragraph summary that mimics a **Bloomberg Pro Terminal alert**. The tone is professional, urgent, and confident.

#### b. Dynamic Data Inputs

The prompt is fed a rich set of real-time technical data for a specific asset. This includes:
*   Asset Symbol (`symbol`)
*   Current Price (`price`)
*   Trend Direction (`isBullish`)
*   Key Trade Levels (`entry`, `sl`, `tp1`)
*   Technical Indicators (`confluenceCount`, `demandZone`, `fvg`, `volumeImbalance`)
*   Chart Pattern Name (`chartPatternName`)
*   Multi-Timeframe Analysis (`multiTimeframeAnalysis`)

#### c. Tool Use: `getMarketNews`

*   A crucial part of the prompt's logic is its ability to use tools. Before generating its summary, the AI is instructed to call the `getMarketNews` tool.
*   This tool fetches recent news headlines related to the asset.
*   The AI is then explicitly tasked with **synthesizing the technical data with the news sentiment**, determining if the news provides "tailwinds" (supports the trade) or "headwinds" (contradicts the trade). This elevates the analysis beyond simple technicals.

#### d. Structured Output Instructions

The prompt gives the AI a strict, non-negotiable structure for its output paragraph to ensure consistency and quality:
1.  **Opening Statement:** Must begin with "Strong [bullish/bearish] setup presents itself..."
2.  **Core Data Integration:** Must mention price, entry, SL, TP, and confluence count.
3.  **Key Level Highlighting:** Must comment on smart money levels (demand zones, FVG) and the identified chart pattern.
4.  **Multi-Timeframe Context:** Must comment on the alignment across different timeframes (e.g., if the daily trend supports the 15-minute signal).
5.  **News Sentiment Integration:** Must state the impact of the news (tailwinds/headwinds).
6.  **Volume Bias:** Must incorporate the volume imbalance data.
7.  **Concluding Remark:** Must end with a sharp, confident conclusion about the trading opportunity.

This detailed, structured approach is what allows the AI to consistently produce high-quality, professional-grade market insights that form the core of the "Elite Mode" feature.
