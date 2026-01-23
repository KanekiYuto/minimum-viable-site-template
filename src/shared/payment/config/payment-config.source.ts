export const paymentConfigSource = {
  "creditPacks": [
    {
      "id": "mini_30d",
      "name": "mini",
      "price": 10,
      "bonusRate": 0,
      "credits": 800,
      "validDays": 30,
      "ids": {
        "historical": [] as string[]
      }
    },
    {
      "id": "standard_30d",
      "name": "standard",
      "price": 50,
      "bonusRate": 0.15,
      "credits": 4600,
      "validDays": 30,
      "ids": {
        "historical": [] as string[]
      }
    },
    {
      "id": "pro_30d",
      "name": "pro",
      "price": 200,
      "bonusRate": 0.3,
      "credits": 20800,
      "validDays": 30,
      "ids": {
        "historical": [] as string[]
      }
    },
    {
      "id": "max_30d",
      "name": "max",
      "price": 1000,
      "bonusRate": 0.45,
      "credits": 116000,
      "validDays": 30,
      "ids": {
        "historical": [] as string[]
      }
    },
    {
      "id": "mini_365d",
      "name": "mini",
      "price": 12,
      "bonusRate": 0,
      "credits": 800,
      "validDays": 365,
      "ids": {
        "historical": [] as string[]
      }
    },
    {
      "id": "standard_365d",
      "name": "standard",
      "price": 60,
      "bonusRate": 0.15,
      "credits": 4600,
      "validDays": 365,
      "ids": {
        "historical": [] as string[]
      }
    },
    {
      "id": "pro_365d",
      "name": "pro",
      "price": 240,
      "bonusRate": 0.3,
      "credits": 20800,
      "validDays": 365,
      "ids": {
        "historical": [] as string[]
      }
    },
    {
      "id": "max_365d",
      "name": "max",
      "price": 1200,
      "bonusRate": 0.45,
      "credits": 116000,
      "validDays": 365,
      "ids": {
        "historical": [] as string[]
      }
    }
  ],
  "subscriptions": {
    "monthly_basic": {
      "planType": "basic",
      "billingCycle": "monthly",
      "price": 10,
      "credits": 1500,
      "periodMonths": 1,
      "concurrency": {
        "image": 8,
        "video": 2
      },
      "ids": {
        "historical": [] as string[]
      }
    },
    "yearly_basic": {
      "planType": "basic",
      "billingCycle": "yearly",
      "price": 96,
      "credits": 21600,
      "periodMonths": 12,
      "concurrency": {
        "image": 8,
        "video": 2
      },
      "ids": {
        "historical": [] as string[]
      }
    },
    "monthly_plus": {
      "planType": "plus",
      "billingCycle": "monthly",
      "price": 20,
      "credits": 4500,
      "periodMonths": 1,
      "concurrency": {
        "image": 12,
        "video": 4
      },
      "ids": {
        "historical": [] as string[]
      }
    },
    "yearly_plus": {
      "planType": "plus",
      "billingCycle": "yearly",
      "price": 192,
      "credits": 64800,
      "periodMonths": 12,
      "concurrency": {
        "image": 12,
        "video": 4
      },
      "ids": {
        "historical": [] as string[]
      }
    },
    "monthly_pro": {
      "planType": "pro",
      "billingCycle": "monthly",
      "price": 100,
      "credits": 20000,
      "periodMonths": 1,
      "concurrency": {
        "image": 60,
        "video": 20
      },
      "ids": {
        "historical": [] as string[]
      }
    },
    "yearly_pro": {
      "planType": "pro",
      "billingCycle": "yearly",
      "price": 960,
      "credits": 288000,
      "periodMonths": 12,
      "concurrency": {
        "image": 60,
        "video": 20
      },
      "ids": {
        "historical": [] as string[]
      }
    }
  }
} as const;
