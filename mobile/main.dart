import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_fonts/google_fonts.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(NeuralisApp());
}

class NeuralisApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NEURALIS Super App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Color(0xFF030303),
        primaryColor: Color(0xFFC5A059),
        textTheme: GoogleFonts.interTextTheme(Theme.of(context).textTheme),
      ),
      home: AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return SplashScreen();
        if (snapshot.hasData) return MainNavigation();
        return LoginScreen();
      },
    );
  }
}

class SplashScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          radialGradient: RadialGradient(
            center: Alignment.topCenter,
            radius: 1.5,
            colors: [Color(0xFFC5A059).withOpacity(0.1), Colors.black],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.brain, color: Color(0xFFC5A059), size: 80),
              SizedBox(height: 20),
              Text('NEURALIS', style: GoogleFonts.playfairDisplay(fontSize: 48, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic, letterSpacing: -2)),
              Text('GLOBAL ORCHESTRATOR', style: GoogleFonts.jetBrainsMono(fontSize: 10, letterSpacing: 6, color: Color(0xFFC5A059).withOpacity(0.6))),
            ],
          ),
        ),
      ),
    );
  }
}

class MainNavigation extends StatefulWidget {
  @override
  _MainNavigationState createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;
  final List<Widget> _screens = [
    DashboardScreen(),
    NeuralFeedScreen(),
    PortfolioScreen(),
    SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        backgroundColor: Color(0xFF050505),
        selectedItemColor: Color(0xFFC5A059),
        unselectedItemColor: Colors.grey.withOpacity(0.3),
        type: BottomNavigationBarType.fixed,
        items: [
           BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Core'),
           BottomNavigationBarItem(icon: Icon(Icons.public), activeIcon: Icon(Icons.public), label: 'Feed'),
           BottomNavigationBarItem(icon: Icon(Icons.wallet_outlined), activeIcon: Icon(Icons.wallet), label: 'Assets'),
           BottomNavigationBarItem(icon: Icon(Icons.settings_outlined), activeIcon: Icon(Icons.settings), label: 'Sync'),
        ],
      ),
    );
  }
}

class NeuralFeedScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView.builder(
        scrollDirection: Axis.vertical,
        itemCount: 5,
        itemBuilder: (context, index) => Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: Stack(
            children: [
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(30),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(backgroundColor: Color(0xFFC5A059), radius: 20),
                        SizedBox(width: 12),
                        Text('StrategyAI // Global', style: TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    SizedBox(height: 15),
                    Text('Alpha Phase Deployment', style: GoogleFonts.playfairDisplay(fontSize: 32, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
                    SizedBox(height: 10),
                    Text('Analyzing high-fidelity transaction nodes across EMEA corridor. Alpha yields projected at +12.4% APY.', style: TextStyle(color: Colors.white70)),
                    SizedBox(height: 30),
                    Row(
                      children: [
                        _actionIcon(Icons.favorite_outline, '1.2k'),
                        SizedBox(width: 20),
                        _actionIcon(Icons.chat_bubble_outline, '89'),
                        SizedBox(width: 20),
                        _actionIcon(Icons.share_outlined, '231'),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _actionIcon(IconData icon, String count) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 28),
        SizedBox(height: 5),
        Text(count, style: TextStyle(fontSize: 10, color: Colors.white70)),
      ],
    );
  }
}

class DashboardScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(30),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.brain_circuit, color: Color(0xFFC5A059), size: 100),
              SizedBox(height: 30),
              Text('NEURAL ZERO', style: GoogleFonts.playfairDisplay(fontSize: 42, fontStyle: FontStyle.italic, fontWeight: FontWeight.w900)),
              SizedBox(height: 10),
              Text('THE ORCHESTRATOR IS OFFLINE', style: GoogleFonts.jetBrainsMono(fontSize: 10, color: Color(0xFFC5A059), letterSpacing: 4)),
              SizedBox(height: 20),
              Text('Your global strategic footprint is currently at Zero. Initialize your first node to begin expansion.', 
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white54, height: 1.5)
              ),
              SizedBox(height: 50),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFFC5A059),
                  foregroundColor: Colors.black,
                  minimumSize: Size(double.infinity, 60),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
                child: Text('INITIALIZE FIRST NODE', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class PortfolioScreen extends StatelessWidget { @override Widget build(BuildContext context) => Scaffold(body: Center(child: Text('NEURAL PORTFOLIO'))); }
class SettingsScreen extends StatelessWidget { @override Widget build(BuildContext context) => Scaffold(body: Center(child: Text('SYNC SETTINGS'))); }

class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
             Text('AUTHENTICATE', style: GoogleFonts.playfairDisplay(fontSize: 32, fontStyle: FontStyle.italic, fontWeight: FontWeight.w900)),
             SizedBox(height: 40),
             TextField(decoration: InputDecoration(labelText: 'Admin Identifier', border: OutlineInputBorder())),
             SizedBox(height: 20),
             TextField(decoration: InputDecoration(labelText: 'Terminal Key', border: OutlineInputBorder()), obscureText: true),
             SizedBox(height: 40),
             ElevatedButton(
               style: ElevatedButton.styleFrom(backgroundColor: Color(0xFFC5A059), foregroundColor: Colors.black, minimumSize: Size(double.infinity, 60)),
               onPressed: () {}, 
               child: Text('ACCESS KERNEL')
             )
          ],
        ),
      ),
    );
  }
}
