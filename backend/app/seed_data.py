"""
Seed data for demo/development.

Run with: python -m app.seed_data
"""
import asyncio
from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.travel import TravelPlan, TravelType, TravelStatus
from app.models.travel_intent import TravelPlanIntent
from app.models.follow import Follow
from app.core.security import get_password_hash


# Sample users with diverse profiles
SAMPLE_USERS = [
    {
        "email": "priya.sharma@gmail.com",
        "name": "Priya Sharma",
        "profession": "Travel Vlogger",
        "company": "YouTube",
        "bio": "Exploring India one city at a time 🌏",
        "profile_type": "creator",
        "location": "Mumbai, India",
        "current_city": "Mumbai",
    },
    {
        "email": "rahul.mehta@startup.io",
        "name": "Rahul Mehta",
        "profession": "Startup Founder",
        "company": "TechVentures",
        "bio": "Building the future, one flight at a time ✈️",
        "profile_type": "founder",
        "location": "Bangalore, India",
        "current_city": "Bangalore",
    },
    {
        "email": "ananya.gupta@corp.com",
        "name": "Ananya Gupta",
        "profession": "Product Manager",
        "company": "Google",
        "bio": "PM by day, explorer by weekend",
        "profile_type": "professional",
        "location": "Hyderabad, India",
        "current_city": "Hyderabad",
    },
    {
        "email": "arjun.patel@design.co",
        "name": "Arjun Patel",
        "profession": "UX Designer",
        "company": "Freelance",
        "bio": "Digital nomad | Coffee enthusiast ☕",
        "profile_type": "traveler",
        "location": "Pune, India",
        "current_city": "Pune",
    },
    {
        "email": "neha.singh@photo.in",
        "name": "Neha Singh",
        "profession": "Photographer",
        "company": "NehaSinghPhotography",
        "bio": "Capturing moments across continents 📸",
        "profile_type": "creator",
        "location": "Delhi, India",
        "current_city": "Delhi",
    },
    {
        "email": "vikram.reddy@vc.fund",
        "name": "Vikram Reddy",
        "profession": "Investor",
        "company": "Sequoia India",
        "bio": "Looking for the next unicorn 🦄",
        "profile_type": "founder",
        "location": "Mumbai, India",
        "current_city": "Mumbai",
    },
    {
        "email": "kavya.nair@writer.blog",
        "name": "Kavya Nair",
        "profession": "Travel Writer",
        "company": "Lonely Planet",
        "bio": "Words & wanderlust ✍️",
        "profile_type": "explorer",
        "location": "Kochi, India",
        "current_city": "Kochi",
    },
    {
        "email": "dev.kumar@tech.io",
        "name": "Dev Kumar",
        "profession": "Software Engineer",
        "company": "Microsoft",
        "bio": "Code. Travel. Repeat.",
        "profile_type": "professional",
        "location": "Bangalore, India",
        "current_city": "Bangalore",
    },
]

# Sample travel plans with max_companions
SAMPLE_TRAVELS = [
    {
        "origin": "Mumbai",
        "origin_code": "BOM",
        "destination": "Goa",
        "destination_code": "GOI",
        "travel_type": TravelType.FLIGHT,
        "flight_number": "6E 2341",
        "notes": "Weekend getaway! Looking for people to explore North Goa",
        "days_from_now": 3,
        "max_companions": 2,
        "intents": ["co_traveller", "food_buddy", "photography"],
        "primary_intent": "co_traveller",
    },
    {
        "origin": "Bangalore",
        "origin_code": "BLR",
        "destination": "Delhi",
        "destination_code": "DEL",
        "travel_type": TravelType.FLIGHT,
        "flight_number": "AI 505",
        "notes": "Investor meetings next week. Open for coffee chats!",
        "days_from_now": 5,
        "max_companions": 1,
        "intents": ["startup_connect", "coffee", "networking"],
        "primary_intent": "startup_connect",
    },
    {
        "origin": "Delhi",
        "origin_code": "DEL",
        "destination": "Jaipur",
        "destination_code": "JAI",
        "travel_type": TravelType.CAR,
        "notes": "Road trip to the Pink City! Need one more for cab share",
        "days_from_now": 7,
        "max_companions": 3,
        "intents": ["cab_share", "co_traveller", "adventure"],
        "primary_intent": "cab_share",
    },
    {
        "origin": "Hyderabad",
        "origin_code": "HYD",
        "destination": "Chennai",
        "destination_code": "MAA",
        "travel_type": TravelType.TRAIN,
        "flight_number": "Shatabdi Exp",
        "notes": "First time visiting Chennai. Would love local recommendations!",
        "days_from_now": 4,
        "max_companions": 0,
        "intents": ["local_guide", "food_buddy", "just_vibes"],
        "primary_intent": "local_guide",
    },
    {
        "origin": "Pune",
        "origin_code": "PNQ",
        "destination": "Mumbai",
        "destination_code": "BOM",
        "travel_type": TravelType.CAR,
        "notes": "Early morning cab to airport. Split the fare?",
        "days_from_now": 2,
        "max_companions": 2,
        "intents": ["cab_share"],
        "primary_intent": "cab_share",
    },
    {
        "origin": "Kochi",
        "origin_code": "COK",
        "destination": "Munnar",
        "destination_code": "MNR",
        "travel_type": TravelType.CAR,
        "notes": "Hill station escape! Looking for travel buddies 🌿",
        "days_from_now": 10,
        "max_companions": 3,
        "intents": ["co_traveller", "photography", "adventure"],
        "primary_intent": "adventure",
    },
    {
        "origin": "Bangalore",
        "origin_code": "BLR",
        "destination": "Goa",
        "destination_code": "GOI",
        "travel_type": TravelType.FLIGHT,
        "flight_number": "SG 831",
        "notes": "Creator meetup in Goa! DM if you're in the content space",
        "days_from_now": 8,
        "max_companions": 5,
        "intents": ["creator_collab", "brand_collab", "networking"],
        "primary_intent": "creator_collab",
    },
    {
        "origin": "Delhi",
        "origin_code": "DEL",
        "destination": "Rishikesh",
        "destination_code": "DED",
        "travel_type": TravelType.BUS,
        "notes": "Yoga retreat + adventure sports. Who's in?",
        "days_from_now": 12,
        "max_companions": 4,
        "intents": ["adventure", "co_traveller", "just_vibes"],
        "primary_intent": "adventure",
    },
]


def seed_database():
    """Seed the database with sample data."""
    db = SessionLocal()
    
    try:
        # Check if already seeded
        existing_users = db.query(User).filter(User.email.like("%@gmail.com")).first()
        if existing_users:
            print("Database already seeded. Skipping...")
            return
        
        print("🌱 Seeding database...")
        
        # Create users
        users = []
        for user_data in SAMPLE_USERS:
            user = User(
                id=uuid4(),
                email=user_data["email"],
                hashed_password=get_password_hash("password123"),
                name=user_data["name"],
                profession=user_data.get("profession"),
                company=user_data.get("company"),
                bio=user_data.get("bio"),
                profile_type=user_data.get("profile_type"),
                location=user_data.get("location"),
                current_city=user_data.get("current_city"),
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            users.append(user)
        
        db.commit()
        print(f"✅ Created {len(users)} users")
        
        # Create travel plans
        travel_count = 0
        for i, travel_data in enumerate(SAMPLE_TRAVELS):
            user = users[i % len(users)]
            
            travel = TravelPlan(
                id=uuid4(),
                user_id=user.id,
                origin=travel_data["origin"],
                origin_code=travel_data.get("origin_code"),
                destination=travel_data["destination"],
                destination_code=travel_data.get("destination_code"),
                travel_date=datetime.utcnow() + timedelta(days=travel_data["days_from_now"]),
                travel_type=travel_data["travel_type"],
                flight_number=travel_data.get("flight_number"),
                notes=travel_data.get("notes"),
                max_companions=travel_data.get("max_companions", 0),
                status=TravelStatus.PLANNED,
                is_public="public",
            )
            db.add(travel)
            db.commit()
            
            # Add intents
            for intent_key in travel_data.get("intents", []):
                intent = TravelPlanIntent(
                    id=uuid4(),
                    travel_plan_id=travel.id,
                    intent_key=intent_key,
                    is_primary=(intent_key == travel_data.get("primary_intent")),
                )
                db.add(intent)
            
            travel_count += 1
        
        db.commit()
        print(f"✅ Created {travel_count} travel plans with intents")
        
        # Create some follow relationships
        follow_count = 0
        for i, user in enumerate(users):
            # Each user follows 2-3 random other users
            for j in range(2, 4):
                other_user = users[(i + j) % len(users)]
                if other_user.id != user.id:
                    follow = Follow(
                        id=uuid4(),
                        follower_id=user.id,
                        following_id=other_user.id,
                    )
                    db.add(follow)
                    follow_count += 1
        
        db.commit()
        print(f"✅ Created {follow_count} follow relationships")
        
        print("\n🎉 Database seeded successfully!")
        print("\n📝 Sample login credentials:")
        print("   Email: priya.sharma@gmail.com")
        print("   Password: password123")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()


