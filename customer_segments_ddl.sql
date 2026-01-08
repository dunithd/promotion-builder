
-- Main segments table
CREATE TABLE customer_segments (
    segment_id SERIAL PRIMARY KEY,
    segment_name VARCHAR(100) NOT NULL,
    segment_description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'behavioral', 'demographic', 'value-based', 'lifecycle'
    
    -- Segment criteria (stored as JSONB for flexibility)
    criteria JSONB NOT NULL,
    
    -- Metadata
    estimated_size INTEGER, -- approximate number of customers in segment
    avg_lifetime_value DECIMAL(10,2),
    avg_order_value DECIMAL(10,2),
    avg_purchase_frequency DECIMAL(5,2), -- purchases per month
    
    -- Engagement metrics
    avg_email_open_rate DECIMAL(5,2), -- percentage
    avg_email_click_rate DECIMAL(5,2), -- percentage
    avg_conversion_rate DECIMAL(5,2), -- percentage
    
    -- Segment characteristics (tags for AI matching)
    characteristics TEXT[], -- array of tags like 'high_value', 'price_sensitive', 'health_conscious'
    
    -- Best practices
    recommended_channels TEXT[], -- e.g., ['email', 'sms', 'push']
    best_send_times VARCHAR(50), -- e.g., 'weekday_mornings', 'weekend_afternoons'
    typical_incentive_response VARCHAR(100), -- what offers work best
    
    -- Administrative
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_calculated_at TIMESTAMP,
    
    -- AI matching scores (for campaign goal matching)
    use_cases TEXT[] -- e.g., ['product_launch', 'win_back', 'cross_sell']
);


-- 1. Smoothie & Wellness Buyers (for Matcha Sunrise campaign)
INSERT INTO customer_segments (
    segment_name,
    segment_description,
    category,
    criteria,
    estimated_size,
    avg_lifetime_value,
    avg_order_value,
    avg_purchase_frequency,
    avg_email_open_rate,
    avg_email_click_rate,
    avg_conversion_rate,
    characteristics,
    recommended_channels,
    best_send_times,
    typical_incentive_response,
    use_cases
) VALUES (
    'Smoothie & Wellness Enthusiasts',
    'Customers who regularly purchase smoothies, protein bowls, wellness shots, or other health-focused products. Strong interest in nutritional benefits and clean ingredients.',
    'behavioral',
    '{
        "purchase_history": {
            "product_categories": ["smoothies", "wellness_shots", "protein_bowls", "matcha_drinks"],
            "min_purchases": 3,
            "timeframe_days": 90
        },
        "preferences": {
            "health_conscious": true,
            "dietary_tags": ["organic", "plant_based", "superfood"]
        }
    }'::JSONB,
    1250,
    156.00,
    8.50,
    3.2,
    42.50,
    14.20,
    18.50,
    ARRAY['health_conscious', 'trend_aware', 'premium_willing', 'morning_visitor'],
    ARRAY['email', 'instagram', 'sms'],
    'weekday_mornings',
    'Responds well to health benefits messaging and moderate discounts (10-20%)',
    ARRAY['product_launch', 'seasonal_promotion', 'health_wellness']
);

-- 2. Spring Seasonal Shoppers (for Matcha Sunrise campaign)
INSERT INTO customer_segments (
    segment_name,
    segment_description,
    category,
    criteria,
    estimated_size,
    avg_lifetime_value,
    avg_order_value,
    avg_purchase_frequency,
    avg_email_open_rate,
    avg_email_click_rate,
    avg_conversion_rate,
    characteristics,
    recommended_channels,
    best_send_times,
    typical_incentive_response,
    use_cases
) VALUES (
    'Spring Seasonal Shoppers',
    'Customers who show increased purchase activity during spring months (March-May) and respond well to seasonal product launches. History of trying new spring menu items.',
    'seasonal',
    '{
        "seasonal_pattern": {
            "active_months": [3, 4, 5],
            "year_over_year_increase": 40,
            "tried_seasonal_items": true
        },
        "purchase_history": {
            "min_spring_purchases_last_year": 5,
            "new_product_adopter": true
        }
    }'::JSONB,
    890,
    132.00,
    7.25,
    2.8,
    38.00,
    12.50,
    16.00,
    ARRAY['seasonal_buyer', 'early_adopter', 'variety_seeker'],
    ARRAY['email', 'social_media'],
    'weekend_afternoons',
    'Responds to seasonal themes and limited-time offers',
    ARRAY['product_launch', 'seasonal_promotion', 'new_product_introduction']
);

-- 3. Lapsed VIP Customers (for win-back campaign)
INSERT INTO customer_segments (
    segment_name,
    segment_description,
    category,
    criteria,
    estimated_size,
    avg_lifetime_value,
    avg_order_value,
    avg_purchase_frequency,
    avg_email_open_rate,
    avg_email_click_rate,
    avg_conversion_rate,
    characteristics,
    recommended_channels,
    best_send_times,
    typical_incentive_response,
    use_cases
) VALUES (
    'Lapsed VIP Customers',
    'Previously high-value customers who visited weekly but have not made a purchase in 60-90 days. Lifetime spend over $200. High re-engagement potential.',
    'lifecycle',
    '{
        "lifecycle_stage": "lapsed",
        "dormancy_period": {
            "min_days": 60,
            "max_days": 90
        },
        "historical_behavior": {
            "min_lifetime_value": 200,
            "previous_frequency": "weekly",
            "min_total_orders": 10,
            "avg_monthly_visits_when_active": 4
        }
    }'::JSONB,
    420,
    287.00,
    9.80,
    0.0,
    52.00,
    22.00,
    31.00,
    ARRAY['high_value', 'lapsed', 'win_back_priority', 'former_regular'],
    ARRAY['email', 'sms', 'direct_mail'],
    'weekday_evenings',
    'Requires strong incentives - free items or multi-visit discounts work best',
    ARRAY['win_back', 're_engagement', 'retention']
);

-- 4. Former Weekly Visitors (for win-back campaign)
INSERT INTO customer_segments (
    segment_name,
    segment_description,
    category,
    criteria,
    estimated_size,
    avg_lifetime_value,
    avg_order_value,
    avg_purchase_frequency,
    avg_email_open_rate,
    avg_email_click_rate,
    avg_conversion_rate,
    characteristics,
    recommended_channels,
    best_send_times,
    typical_incentive_response,
    use_cases
) VALUES (
    'Former Weekly Visitors',
    'Customers who previously visited 3-5 times per month but are now inactive for 60-90 days. Medium to high lifetime value. Strong habit-breaking event likely occurred.',
    'lifecycle',
    '{
        "lifecycle_stage": "lapsed",
        "dormancy_period": {
            "min_days": 60,
            "max_days": 90
        },
        "historical_behavior": {
            "monthly_visits_when_active": [3, 5],
            "min_lifetime_value": 150,
            "habit_strength": "high"
        }
    }'::JSONB,
    680,
    198.00,
    8.20,
    0.0,
    48.00,
    19.50,
    27.00,
    ARRAY['lapsed', 'former_regular', 'habit_broken', 'medium_high_value'],
    ARRAY['email', 'sms'],
    'their_previous_visit_time',
    'Responds to habit rebuilding campaigns and personalized "we miss you" messaging',
    ARRAY['win_back', 're_engagement', 'habit_formation']
);

-- 5. Morning Drink-Only Regulars (for breakfast bundle cross-sell)
INSERT INTO customer_segments (
    segment_name,
    segment_description,
    category,
    criteria,
    estimated_size,
    avg_lifetime_value,
    avg_order_value,
    avg_purchase_frequency,
    avg_email_open_rate,
    avg_email_click_rate,
    avg_conversion_rate,
    characteristics,
    recommended_channels,
    best_send_times,
    typical_incentive_response,
    use_cases
) VALUES (
    'Morning Drink-Only Regulars',
    'Regular customers who visit between 7-10am and consistently order only beverages without food. 5+ visits in last 60 days. Prime candidates for breakfast bundles.',
    'behavioral',
    '{
        "visit_pattern": {
            "time_of_day": ["07:00", "10:00"],
            "frequency_last_60_days": 5,
            "min_frequency": 5
        },
        "purchase_behavior": {
            "drink_only_orders_percentage": 90,
            "food_purchases_last_60_days": 0,
            "avg_items_per_order": 1
        }
    }'::JSONB,
    1580,
    142.00,
    5.50,
    4.5,
    44.00,
    16.00,
    19.00,
    ARRAY['morning_visitor', 'regular', 'drink_focused', 'upsell_opportunity', 'routine_buyer'],
    ARRAY['email', 'sms', 'in_app'],
    'early_morning',
    'Responds to bundle pricing and convenience messaging. Same-day mobile offers highly effective.',
    ARRAY['cross_sell', 'upsell', 'average_order_value', 'habit_stacking']
);

-- 6. Espresso-Based Morning Customers (sub-segment for breakfast)
INSERT INTO customer_segments (
    segment_name,
    segment_description,
    category,
    criteria,
    estimated_size,
    avg_lifetime_value,
    avg_order_value,
    avg_purchase_frequency,
    avg_email_open_rate,
    avg_email_click_rate,
    avg_conversion_rate,
    characteristics,
    recommended_channels,
    best_send_times,
    typical_incentive_response,
    use_cases
) VALUES (
    'Espresso Morning Regulars',
    'Morning regulars who prefer espresso-based drinks (lattes, cappuccinos, americanos). Strong preference for traditional coffee shop experience. Likely to pair with pastries.',
    'behavioral',
    '{
        "visit_pattern": {
            "time_of_day": ["07:00", "10:00"],
            "frequency_last_60_days": 5
        },
        "product_preferences": {
            "primary_category": "espresso_drinks",
            "favorite_products": ["latte", "cappuccino", "americano", "cortado"],
            "drink_only_percentage": 85
        }
    }'::JSONB,
    890,
    156.00,
    6.20,
    4.2,
    46.00,
    17.50,
    21.00,
    ARRAY['morning_visitor', 'espresso_lover', 'traditional', 'pastry_compatible'],
    ARRAY['email', 'sms'],
    'early_morning',
    'Responds to classic pairings (croissant + latte) and European-style breakfast bundles',
    ARRAY['cross_sell', 'pairing_suggestions', 'traditional_breakfast']
);

-- 7. Sweet Latte Enthusiasts (sub-segment for breakfast)
INSERT INTO customer_segments (
    segment_name,
    segment_description,
    category,
    criteria,
    estimated_size,
    avg_lifetime_value,
    avg_order_value,
    avg_purchase_frequency,
    avg_email_open_rate,
    avg_email_click_rate,
    avg_conversion_rate,
    characteristics,
    recommended_channels,
    best_send_times,
    typical_incentive_response,
    use_cases
) VALUES (
    'Sweet Latte Morning Buyers',
    'Morning customers who prefer flavored lattes (vanilla, caramel, mocha, seasonal). Open to trying new flavors and sweet pairings like muffins or sweet pastries.',
    'behavioral',
    '{
        "visit_pattern": {
            "time_of_day": ["07:00", "10:00"],
            "frequency_last_60_days": 5
        },
        "product_preferences": {
            "primary_category": "flavored_lattes",
            "flavor_preferences": ["vanilla", "caramel", "mocha", "seasonal"],
            "sweetness_preference": "medium_high",
            "drink_only_percentage": 90
        }
    }'::JSONB,
    720,
    138.00,
    5.80,
    4.0,
    43.00,
    15.50,
    18.50,
    ARRAY['morning_visitor', 'sweet_tooth', 'flavor_adventurous', 'muffin_compatible'],
    ARRAY['email', 'instagram', 'sms'],
    'early_morning',
    'Responds to sweet pairings (muffin + vanilla latte) and flavor-forward bundles',
    ARRAY['cross_sell', 'sweet_pairings', 'new_flavors']
);

-- 8. Price-Sensitive Regulars (for breakfast bundle value angle)
INSERT INTO customer_segments (
    segment_name,
    segment_description,
    category,
    criteria,
    estimated_size,
    avg_lifetime_value,
    avg_order_value,
    avg_purchase_frequency,
    avg_email_open_rate,
    avg_email_click_rate,
    avg_conversion_rate,
    characteristics,
    recommended_channels,
    best_send_times,
    typical_incentive_response,
    use_cases
) VALUES (
    'Value-Conscious Regular Customers',
    'Frequent customers with lower average order values who respond strongly to discounts and bundle pricing. Regular visitors but price-sensitive.',
    'value-based',
    '{
        "purchase_behavior": {
            "frequency_last_60_days": 8,
            "avg_order_value_max": 6.00,
            "discount_usage_rate": 75,
            "bundle_purchase_rate": 45
        },
        "price_sensitivity": "high",
        "promotion_responsiveness": "very_high"
    }'::JSONB,
    950,
    98.00,
    4.80,
    5.5,
    51.00,
    24.00,
    28.00,
    ARRAY['price_sensitive', 'discount_seeker', 'bundle_buyer', 'high_frequency'],
    ARRAY['email', 'sms', 'app_push'],
    'anytime',
    'Highly responsive to percentage discounts, bundle deals, and "save $X" messaging',
    ARRAY['discount_campaigns', 'bundle_promotions', 'value_messaging']
);

-- 9. Active Coffee Subscribers (complement/exclude segment)
INSERT INTO customer_segments (
    segment_name,
    segment_description,
    category,
    criteria,
    estimated_size,
    avg_lifetime_value,
    avg_order_value,
    avg_purchase_frequency,
    avg_email_open_rate,
    avg_email_click_rate,
    avg_conversion_rate,
    characteristics,
    recommended_channels,
    best_send_times,
    typical_incentive_response,
    use_cases
) VALUES (
    'Active Subscription Members',
    'Customers currently enrolled in coffee subscription or membership program. Already buying combos or getting regular benefits. Should be excluded from certain acquisition campaigns.',
    'lifecycle',
    '{
        "subscription_status": "active",
        "enrollment_date": "active",
        "purchase_behavior": {
            "frequency": "high",
            "avg_monthly_visits": 12,
            "combo_purchase_rate": 65
        }
    }'::JSONB,
    340,
    425.00,
    12.50,
    12.0,
    58.00,
    28.00,
    35.00,
    ARRAY['subscriber', 'high_value', 'loyal', 'already_maximized'],
    ARRAY['email', 'app_push'],
    'anytime',
    'Responds to exclusive perks, early access, and VIP experiences rather than discounts',
    ARRAY['retention', 'vip_programs', 'exclusion_list']
);

-- 10. New Customer Trial Period (for nurturing, not immediate campaigns)
INSERT INTO customer_segments (
    segment_name,
    segment_description,
    category,
    criteria,
    estimated_size,
    avg_lifetime_value,
    avg_order_value,
    avg_purchase_frequency,
    avg_email_open_rate,
    avg_email_click_rate,
    avg_conversion_rate,
    characteristics,
    recommended_channels,
    best_send_times,
    typical_incentive_response,
    use_cases
) VALUES (
    'New Customers (First 30 Days)',
    'Customers who made their first purchase within the last 30 days. In critical relationship-building phase. Should be nurtured differently than established customers.',
    'lifecycle',
    '{
        "lifecycle_stage": "new",
        "first_purchase": {
            "days_ago_max": 30,
            "days_ago_min": 0
        },
        "total_purchases": {
            "min": 1,
            "max": 3
        }
    }'::JSONB,
    580,
    24.00,
    6.80,
    1.2,
    35.00,
    11.00,
    12.00,
    ARRAY['new_customer', 'relationship_building', 'habit_formation_phase'],
    ARRAY['email', 'sms'],
    'varies',
    'Responds to welcome series, education about offerings, and second-visit incentives',
    ARRAY['onboarding', 'welcome_series', 'habit_formation']
);