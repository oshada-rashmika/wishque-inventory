# Financial Plan: Wishque Inventory Management System (IMS)

## 1. Executive Summary
This document outlines the financial plan and cost estimation for the deployment, operation, and maintenance of the Wishque Inventory Management System (IMS). The plan follows industry standards for software financial projections, categorized into Capital Expenditure (CapEx) and Operating Expenditure (OpEx). All estimates are provided in Sri Lankan Rupees (LKR).

## 2. Infrastructure & Software Costs (SaaS / Cloud Services)

By leveraging modern cloud architecture and serverless technologies, the infrastructure costs have been heavily optimized.

| Service Category | Provider / Service | Cost (Monthly) | Remarks |
| :--- | :--- | :--- | :--- |
| **Frontend Hosting** | [Vercel](https://vercel.com/) | LKR 0.00 | Utilizing Vercel Hobby/Free tier for serverless deployment. |
| **Domain Name** | Vercel (`.vercel.app`) | LKR 0.00 | Free subdomain provided by Vercel. |
| **Backend & Database** | [Supabase](https://supabase.com/) | LKR 0.00 | Utilizing Supabase Free tier (PostgreSQL, Auth, Storage). |
| **Version Control** | [GitHub](https://github.com/) | LKR 0.00 | Free private repositories for source code management. |
| **UI Framework** | Next.js, Shadcn UI, Tailwind | LKR 0.00 | Open-source technologies, zero licensing fees. |
| **Subtotal (Infrastructure)**| | **LKR 0.00** | Highly optimized for initial scale. |

*Note: If the application scales beyond the free tier limits (e.g., >50,000 active users/month on Supabase, or enterprise team features on Vercel), paid tiers will apply. (Vercel Pro: ~$20/mo ~ LKR 6,000, Supabase Pro: ~$25/mo ~ LKR 7,500).*

## 3. Operational & Manpower Costs (OpEx)

These are the recurring monthly costs required to maintain the system, ensure uptime, and perform daily operations.

| Expense Category | Description | Cost (Monthly) |
| :--- | :--- | :--- |
| **Manpower** | 1x Dedicated Staff Member (Developer/Admin) for system monitoring, updates, data entry, and maintenance. | LKR 150,000.00 |
| **Internet Connection** | Fibre Unlimited connection (e.g., SLT Fibre Unlimited) for high-speed, uninterrupted access. | LKR 6,500.00 |
| **Electricity / Utilities** | Allocated utility cost for one workstation operating standard working hours. | LKR 2,500.00 |
| **Subtotal (Operations)**| | **LKR 159,000.00** |

## 4. Equipment & Depreciation (CapEx / Amortized)

While capital expenditure is an upfront cost, it is standard practice to amortize equipment costs over their useful lifespan (typically 3-5 years for IT equipment).

| Expense Category | Description | Estimated Value | Monthly Amortization (3 Years) |
| :--- | :--- | :--- | :--- |
| **Workstation** | Laptop/PC for the dedicated staff member. | LKR 450,000.00 | LKR 12,500.00 |
| **Misc. Equipment** | Peripherals, UPS, etc. | LKR 25,000.00 | LKR 694.44 |
| **Subtotal (Equipment)**| | **LKR 475,000.00** | **LKR 13,194.44** |

## 5. Total Cost of Ownership (TCO) Summary

| Category | Monthly Cost (LKR) | Annual Cost (LKR) |
| :--- | :--- | :--- |
| **Infrastructure & SaaS Services** | 0.00 | 0.00 |
| **Manpower & Operations** | 159,000.00 | 1,908,000.00 |
| **Amortized Equipment (Optional)** | 13,194.44 | 158,333.28 |
| **Total Estimated Operating Cost** | **LKR 172,194.44** | **LKR 2,066,333.28** |

## 6. Optimization Strategies & Risk Management
1. **Cloud Lock-in Mitigation**: The architecture uses standard PostgreSQL (via Supabase) and standard React/Next.js conventions, allowing relatively easy migration if Vercel or Supabase alter their free-tier policies.
2. **Scalability Triggers**: Cost only increases when platform usage spikes. A dedicated budget of LKR 15,000/month should be earmarked for potential cloud upgrades if user traffic grows significantly.
3. **Manpower Utilization**: The dedicated staff member can also cross-functionally support other digital operations or IT tasks to maximize ROI on manpower expenditure.

---
*Generated based on current market rates and Free-Tier cloud offerings. Internet and utility rates are estimates and may vary based on the specific service provider and local tariffs.*
