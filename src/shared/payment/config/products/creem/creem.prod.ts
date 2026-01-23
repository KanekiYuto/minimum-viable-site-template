export const creemProducts = {
  "creditPacks": [
    {
      "id": "mini_30d",
      "name": "mini",
      "price": 10,
      "bonusRate": 0,
      "credits": 800,
      "validDays": 30,
      "ids": {
        "current": "prod_7Cb8jUGrCqerriwDa4DxnJ",
        "historical": []
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
        "current": "prod_2FGuXCKcXZBw4NiviDEDy1",
        "historical": []
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
        "current": "prod_2Z9VyZCqs1tXGxCZr2LUJH",
        "historical": []
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
        "current": "prod_pYK7P3NawhNCtmd8XsFcA",
        "historical": []
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
        "current": "prod_4xsoA2mSamC2nP4FDTWDYF",
        "historical": []
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
        "current": "prod_XlSY0U6JHkCJtZtj4nRem",
        "historical": []
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
        "current": "prod_2Xo774NcjvbQUrR3qqkNUr",
        "historical": []
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
        "current": "prod_2nVd4C15ioa1gxe04ueBYm",
        "historical": []
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
        "current": "prod_8eCp318WnAdyqWBpnrE7g",
        "historical": []
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
        "current": "prod_6EvVZICyFbuCDlOTL1QPj0",
        "historical": []
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
        "current": "prod_i94XIMZpHVTzcgFT11qSU",
        "historical": []
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
        "current": "prod_1AWX48gzZyMWbjIWr8aW8N",
        "historical": []
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
        "current": "prod_786I7rgWifOjRLjDFTRejk",
        "historical": []
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
        "current": "prod_2fzMGebZTCceTY6QeO0Iwo",
        "historical": []
      }
    }
  }
} as const;
