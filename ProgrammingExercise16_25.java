import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.TreeMap;
import java.awt.image.*;
import java.applet.AudioClip;
import java.applet.Applet;
import java.io.*;
import javax.swing.event.*;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.HashSet;
public class ProgrammingExercise16_25 extends JPanel{
   private static JFrame frame;
   private JButton start = new JButton("Start");
   private JTextArea jta;
   private JScrollPane jsp;
   public ProgrammingExercise16_25(){
      setPreferredSize(new Dimension(600, 400));
      //setLocationRelativeTo(null);
      //setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
      //setTitle("ProgrammingExercise16_25");
      setLayout(new BorderLayout());
      jta = new JTextArea();
      jta.setLineWrap(true);
      jta.setWrapStyleWord(true);
      jta.setFont(new Font("Serif", Font.PLAIN, 30));
      jta.setText("This game is called Balloon Shooter.  Try to shoot as many balloons as you can.  Move gun with left and right arrow keys.  Shoot with either the up arrow key or the space bar(Hint: Try not to shoot too many balloons at once or the game will lag at the later stages of the game).  If you miss three balloons the game is over.  Press p to pause and play.");
      jta.setEditable(false);
      jsp = new JScrollPane(jta,ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED,ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
      add(jsp, BorderLayout.CENTER);
      add(start, BorderLayout.SOUTH);
      start.addActionListener(new StartListener());
   }
   private class StartListener implements ActionListener{
      public void actionPerformed(ActionEvent e){
         /*frame = new JFrame();
         frame.setTitle("ProgrammingExercise16_25");
         frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);*/
         JPanel panel = new ProgrammingExercise16_25Panel(frame);
         panel.setFocusable(true);
         panel.requestFocusInWindow();
         panel.requestFocus();
         frame.requestFocus();
         frame.setContentPane(panel);
         frame.pack();
         frame.setLocationRelativeTo(null);
         frame.setVisible(true);
         panel.setFocusable(true);
         panel.requestFocusInWindow();
         //SF.setVisible(false);
      }
   }
   public static void main(String[] args){
      /*JFrame startFrame = new ProgrammingExercise16_25();
      startFrame.setVisible(true);*/
      //frame.setVisible(true);
      frame = new JFrame();
      frame.setTitle("ProgrammingExercise16_25");
      frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
      frame.setContentPane(new ProgrammingExercise16_25());
      frame.pack();
      frame.setLocationRelativeTo(null);
      frame.setVisible(true);
   }   
}
class ProgrammingExercise16_25Panel extends JPanel implements ActionListener{
   private Gun gun;
   private JPanel buttonPanel = new JPanel();
   private JButton leaderboard = new JButton("Leaderboard/Submit Score"),
   pause = new JButton("Pause"), play = new JButton("Play");
   private BufferedImage myImage;
   private Graphics2D myBuffer;
   private int oldX = 0, oldY = 0;
   private Spot accessor = new Spot(-10, -10, -10, Color.BLACK);
   private Balloon missAccessor; 
   private Bullet pauseHandler;
   private boolean active = true, paused = false, mouse = false;
   private Aimer aimer;
   private Timer repaintTimer;
   private BalloonMaker balloonMaker;
   private JFrame frame;
   public ProgrammingExercise16_25Panel(JFrame f){
      setFocusable(true);
      setLayout(new BorderLayout());
      setPreferredSize(new Dimension(600, 480));
      this.frame = f;
      //leaderboard.setPreferredSize(new Dimension(0, 80));
      leaderboard.setEnabled(false);
      leaderboard.addActionListener(this);
      pause.addActionListener(new PauseListener(this));
      play.addActionListener(new PlayListener());
      buttonPanel.add(leaderboard);
      buttonPanel.add(pause);
      buttonPanel.add(play);
      add(buttonPanel, BorderLayout.SOUTH);
      requestFocus();
      requestFocusInWindow();
      myImage = new BufferedImage(600, 400, BufferedImage.TYPE_INT_RGB);
      myBuffer = (Graphics2D) myImage.getGraphics();
      aimer = new Aimer(myBuffer);
      pauseHandler = new Bullet(-30, -30, 2, myBuffer, new LinkedList<Balloon>());
      myBuffer.setBackground(Color.WHITE);
      myBuffer.clearRect(0, 0, myImage.getWidth(), myImage.getHeight());
      missAccessor = new Balloon(-20, -20, myBuffer);
      repaintTimer = new Timer(5, this);
      repaintTimer.start();
      gun = new Gun(myImage, myBuffer);
      gun.turnLeft(myBuffer);
      gun.turnRight(myBuffer);
      myBuffer.setFont(new Font("SansSerf", Font.PLAIN, 18));
      balloonMaker = new BalloonMaker(myBuffer, 600, 400);
      Thread thread2 = new Thread(balloonMaker);
      thread2.start();
      pause.doClick();
      play.doClick();
      play.setEnabled(false);
      addKeyListener(new Key());
      addMouseListener(new Mouse());
      addMouseMotionListener(
            new MouseMotionListener(){
               public void mouseMoved(MouseEvent moved){
                  if(active){
                     if(moved.getY() <= 400){
                        mouse = true;
                        double a = moved.getX();
                        double b = moved.getY();
                        double x = gun.getBaseX();
                        double y = gun.getBaseY();
                        double ang = -1.0 * Math.toDegrees(Math.atan((a - x) / (b - y)));
                        aimer.clear(aimer.getX(), aimer.getY());
                        aimer.drawMe((int)a, (int)b);
                        oldX = (int)a;
                        oldY = (int)b;
                        gun.changeAngle(ang + 270, myBuffer);
                     }
                     repaint();
                  }
               }
               public void mouseDragged(MouseEvent dragged){
               }
            });
   }
   private class PauseListener implements ActionListener{
      private JPanel panel;
      public PauseListener(JPanel p){
         panel = p;
      }
      public void actionPerformed(ActionEvent e){
         pause.setEnabled(false);
         play.setEnabled(true);
         paused = true;
         active = false;
         missAccessor.setPaused(true);
         pauseHandler.setPaused(true);
         balloonMaker.stop();
      }
   }
   private class PlayListener implements ActionListener{
      public void actionPerformed(ActionEvent e){
         pause.setEnabled(true);
         play.setEnabled(false);
         paused = false;
         missAccessor.setPaused(false);
         pauseHandler.setPaused(false);
         active = true;
         balloonMaker.start();
      }
   }
   public void actionPerformed(ActionEvent ex){
      if(ex.getSource() == leaderboard){
         JFrame leaderboard = new Leaderboard();
         leaderboard.setVisible(true);
         frame.setVisible(false);
      }
      else{
         myBuffer.setColor(Color.WHITE);
         myBuffer.fillRect(260, 0, 100, 60);
         myBuffer.setColor(Color.BLACK);
         if(mouse){
            aimer.drawMe(aimer.getX(), aimer.getY());//if mouse
         }
         myBuffer.drawString("Count: " +accessor.getCount(), 270, 20);
         myBuffer.drawString("Misses: " + missAccessor.getMisses(), 270, 40);
         if(missAccessor.getMisses() > 200){
            balloonMaker.stop();
            active = false;
            leaderboard.setEnabled(true);
            myBuffer.setFont(new Font("SansSerif", Font.PLAIN, 100));
            myBuffer.drawString("Game Over", myImage.getWidth() / 12, myImage.getHeight() / 2);
            myBuffer.setFont(new Font("SansSerf", Font.PLAIN, 18));
            myBuffer.drawString("Count: " +accessor.getCount(), 270, myImage.getHeight() / 20);
            myBuffer.drawString("Misses: " + missAccessor.getMisses(), 270, myImage.getHeight() / 10);
         }
      //myBuffer.drawOval(10, 10, );'
         repaint();
      }
   }
   public void paintComponent(Graphics g){
      g.drawImage(myImage, 0, 0, getWidth(), getHeight() - 80, null);
   }
   private class Key extends KeyAdapter
   {
      public void keyPressed(KeyEvent ex)
      {
         if(active){
            if(ex.getKeyCode() == KeyEvent.VK_LEFT){
               if(gun.getAngle() % 369 > 180)
                  gun.turnLeft(myBuffer);
               mouse = false;
               aimer.clear(aimer.getX(), aimer.getY());
            } 
            if(ex.getKeyCode() == KeyEvent.VK_RIGHT){
               if(gun.getAngle() < 360)
                  gun.turnRight(myBuffer);
               mouse = false;
               aimer.clear(aimer.getX(), aimer.getY());
            }
            if(ex.getKeyCode() == KeyEvent.VK_UP){
               gun.fire(myBuffer, balloonMaker.getBalloonLinkedList());
            }
            if(ex.getKeyCode() == KeyEvent.VK_SPACE){
               gun.fire(myBuffer, balloonMaker.getBalloonLinkedList());
            }
            repaint();
         }
         if(ex.getKeyCode() == KeyEvent.VK_P){
            if(!paused){
               paused = true;
               pause.doClick();
            }
            else{
               paused = false;
               play.doClick();
            }
         }  
      }
   }
   private class Mouse extends MouseAdapter{
      public void mousePressed(MouseEvent e){
         gun.fire(myBuffer, balloonMaker.getBalloonLinkedList());
      }
   }
}
class Gun{
   private int centerX;
   private int gunHeight, gunWidth;
   private int width, height;
   private double angle = 270.0;
   private int myX, myY;
   public Gun(BufferedImage img, Graphics2D myBuffer){
      width = (int)(img.getWidth());
      height = (int)(img.getHeight());
      centerX = width / 2;
      gunWidth = width / 40;
      gunHeight = height / 10;
      myBuffer.setColor(Color.BLACK);
      myBuffer.setStroke(new BasicStroke(8));
      myX = centerX;
      myY = height;
      myBuffer.drawLine(centerX, height - gunHeight, myX, myY);
   }
   public void fire(Graphics2D myBuffer, LinkedList<Balloon> list){
      Thread t1 = new Thread(new Bullet(myX, myY, angle, myBuffer, list));
      t1.start();
      Timer drawTimer = new Timer(24, new FakeListener());
      drawTimer.addActionListener(new DrawListener(drawTimer, myBuffer));
      drawTimer.start();
   }
   private class FakeListener implements ActionListener{
      public void actionPerformed(ActionEvent e){
      }
   }
   private class DrawListener implements ActionListener{
      private Timer dTimer;
      private Graphics2D myBuffer;
      public DrawListener(Timer t, Graphics2D g2D){
         this.dTimer = t;
         this.myBuffer = g2D;
      }
      public void actionPerformed(ActionEvent e){
         Gun.this.drawMe(myBuffer);
         dTimer.stop();
      }
   }
   public void drawMe(Graphics2D myBuffer){
      myBuffer.setColor(Color.BLACK);
      myBuffer.drawLine(myX, myY, centerX, height);
   }
   public void turnLeft(Graphics2D myBuffer){
      myBuffer.setColor(Color.WHITE);
      myBuffer.drawLine((int)(centerX + gunHeight * Math.cos(angle * Math.PI / 180)),(int)(height + gunHeight * Math.sin(angle * Math.PI / 180)), centerX, height);
      angle -= 5;
      int x1 = (int)(centerX + gunHeight * Math.cos(angle * Math.PI / 180));
      int y1 = (int)(height + gunHeight * Math.sin(angle * Math.PI / 180));
      myBuffer.setColor(Color.BLACK);
      myBuffer.drawLine(x1, y1, centerX, height);
      myX = x1;
      myY = y1;
   }
   public void turnRight(Graphics2D myBuffer){
      myBuffer.setColor(Color.WHITE);
      myBuffer.drawLine((int)(centerX + gunHeight * Math.cos(angle * Math.PI / 180)),(int)(height + gunHeight * Math.sin(angle * Math.PI / 180)), centerX, height);
      angle += 5;
      int x1 = (int)(centerX + gunHeight * Math.cos(angle * Math.PI / 180));
      int y1 = (int)(height + gunHeight * Math.sin(angle * Math.PI / 180));
      myBuffer.setColor(Color.BLACK);
      myBuffer.drawLine(x1, y1, centerX, height);
      myX = x1;
      myY = y1;
   }
   public int getBaseX(){
      return centerX;
   }
   public int getBaseY(){
      return height;
   }
   public double getAngle(){
      return angle;
   }
   public void changeAngle(double a, Graphics2D myBuffer){
      myBuffer.setColor(Color.WHITE);
      myBuffer.drawLine((int)(centerX + gunHeight * Math.cos(angle * Math.PI / 180.0)),(int)(height + gunHeight * Math.sin(angle * Math.PI / 180)), centerX, height);
      angle = a;
      int x1 = (int)(centerX + gunHeight * Math.cos(angle * Math.PI / 180.0));
      int y1 = (int)(height + gunHeight * Math.sin(angle * Math.PI / 180.0));
      myBuffer.setColor(Color.BLACK);
      myBuffer.drawLine(x1, y1, centerX, height);
      myX = x1;
      myY = y1;
   }
}
class Spot{
   private double x, y, r;
   private Color c;
   private static int count = 0;
   private boolean popped = false;
   public Spot(double x, double y, double r, Color c){
      this.x = x;
      this.y = y;
      this.r = r;
      this.c = c;
   }
   public double getX(){
      return x;
   }
   public double getY(){
      return y;
   }
   public double getCenterX(){
      return x + getDiameter();
   }
   public double getCenterY(){
      return y + getDiameter();
   }
   public double getRadius(){
      return r;
   }
   public Color getColor(){
      return c;
   }
   public void setColor(Color c1){
      this.c = c1;
   }
   public void setX(double x){
      this.x = x;
   }
   public void setY(double y){
      this.y = y;
   }
   public double getDiameter(){
      return 2 * getRadius();
   }
   public void setRadius(double radius){
      this.r = radius;
   }
   public boolean intersect(Spot s){
     
      double d = distance(this.getX() + this.getRadius(), this.getY() + this.getRadius(), s.getX() + s.getRadius(), s.getY() + s.getRadius()); //add + 5 to s.getY()  
      if( d <= this.getRadius() + s.getRadius()){
         if(!s.getPopped()){
            s.setPopped(true);
            count++;
            return true;
         }
      }
      return false;
   }
   public static int getCount(){
      return count;  
   }
   private double distance(double x1, double y1, double x2, double y2)
   {
      return Math.sqrt(Math.pow((x2 - x1), 2) + 
                      Math.pow((y2 - y1), 2) );  	
   }
   private void setPopped(boolean p){
      this.popped = p;
   }
   public boolean getPopped(){
      return popped;
   }
   public void drawMe(Graphics2D myBuffer){
      myBuffer.setColor(getColor());
      myBuffer.fillOval((int)(getX()), (int)(getY()), (int)getDiameter(), (int)getDiameter());
   }
}
class Bullet extends Spot implements Runnable{
   private double dx, dy;
   private int rightEdge = 605, leftEdge = 12;
   private int bottomEdge = 410;
   private Timer t1;
   private static boolean paused = false;
   private boolean active = true;
   private Graphics2D myBuffer;
   private LinkedList<Balloon> balloonLinkedList;
   public Bullet(double x, double y, double angle, Graphics2D g2D, LinkedList<Balloon> list){
      super(x, y, 5, Color.BLACK);
      balloonLinkedList = list;
      setX(getX() - getRadius());
      setY(getY() - getRadius());
      myBuffer = g2D;
      /*dx = (Math.abs(270.0 - angle) / 10.0);
      dy = -1.0 * (9.0 - dx);
      if(angle < 270){
         dx *= -1;
      }*/
      dx = 5 * Math.cos(Math.toRadians(angle));
      dy = 5 * Math.sin(Math.toRadians(angle));
   
   }
   public void run(){
      t1 = new Timer(10, new Listener(myBuffer));
      t1.start();
   }
   public static void setPaused(boolean b){
      paused = b;
   }
   private class Listener implements ActionListener{
      private Graphics2D myBuffer;
      public Listener(Graphics2D g){
         myBuffer = g;
      }
      public void actionPerformed(ActionEvent e){
         if(!active){
            t1.stop();
         }
         tick();
         drawMe(myBuffer);
      }
   }
   public void tick()
   {
      if(!paused){
         for(int i = 0; i < balloonLinkedList.size(); i++){
            this.intersect(balloonLinkedList.get(i));
         }
         myBuffer.setColor(Color.WHITE);
         myBuffer.drawOval((int)getX(), (int)getY(), (int)getDiameter() - 2, (int)getDiameter() -2 );
         if(getX() >= rightEdge - (getDiameter()))     
         {
            active = false;
         }
         else if(getX() <= -leftEdge){
            active = false;
         }
         else if(getY() <= -10){
            active = false;
         }
         setX(getX() + dx);
         setY(getY() + dy);
      }
   }
   public boolean getAlive(){
      return active;
   }
}
class Balloon extends Spot implements Runnable{
   private double dy;
   private static int misses = 0;
   private boolean active = true;
   private static boolean paused = false;
   private Timer t1;
   private Graphics2D myBuffer;
   public Balloon(int x, int y, Graphics2D g2D){
      super(x, y, 15, new Color((int)(Math.random() * 256), (int)(Math.random() * 256), (int)(Math.random() * 256)));
      this.myBuffer = g2D;
      dy = -.75;
      t1 = new Timer(10, new Listener(myBuffer));
   }
   public static void setPaused(boolean b){
      paused = b;
   }
   public void tick(){
      if(!paused){
         myBuffer.setColor(Color.WHITE);
         myBuffer.drawOval((int)getX(), (int)getY(), (int)getDiameter(), (int)getDiameter());
         myBuffer.setStroke(new BasicStroke(1));
         myBuffer.drawLine((int)(getX() + getRadius()), (int)(getY() + getDiameter()), (int)(getX() + getRadius()), (int)(getY() + (getDiameter() * 3)));
         myBuffer.setStroke(new BasicStroke(8));
         setColor(getColor());
         setY(getY() + dy);
         if(getY() < 0 - (getDiameter() * 3) - 1){
            if(!getPopped()){
               misses++;
            }
            active = false;
         }
      }
   }
   public static int getMisses(){
      return misses;
   }
   public void run(){
      t1.start();
   }
   private class Listener implements ActionListener{
      private Graphics2D myBuffer;
      public Listener(Graphics2D g){
         myBuffer = g;
      }
      public void actionPerformed(ActionEvent e){
         if(!active){
            t1.stop();
            return;
         }
         tick();
         drawMe(myBuffer);
      }
   }
   public boolean getActive(){
      return active;
   }
   @Override
   public void drawMe(Graphics2D myBuffer){
      if(!getPopped()){
         myBuffer.setStroke(new BasicStroke(1));
         myBuffer.setColor(Color.BLACK);
         myBuffer.drawLine((int)(getX() + getRadius()), (int)(getY() + getDiameter()), (int)(getX() + getRadius()), (int)(getY() + (getDiameter() * 3)));
         myBuffer.setColor(getColor());
         myBuffer.fillOval((int)(getX()), (int)(getY()), (int)getDiameter(), (int)getDiameter());
         myBuffer.setStroke(new BasicStroke(8));
      }
   }
}
class BalloonMaker implements Runnable{
   private Graphics2D myBuffer;
   private final int DIAMETER = 7;
   private int rBound, bBound;
   private int remaining = 1800;
   private Timer bMTimer, playTimer;
   private LinkedList<Balloon> balloonLinkedList = new LinkedList<>();
   private LinkedList<Thread> threadLinkedList = new LinkedList<>();
   public BalloonMaker(Graphics2D g2D, int rBound, int bBound){
      this.myBuffer = g2D;
      this.rBound = rBound;
      this.bBound = bBound;
   }
   public void run(){
      bMTimer = new Timer(1800, new BMListener());
      playTimer = new Timer(1, new PlayListener());
      bMTimer.start();
      playTimer.start();
   }
   public void stop(){
      playTimer.stop();
      bMTimer.stop();
   }
   public void start(){
      bMTimer.setInitialDelay(remaining);
      bMTimer.start();
      playTimer.start();
   }
   private class PlayListener implements ActionListener{
      public void actionPerformed(ActionEvent e){
         if(remaining > 0)
            remaining--;
         else
            remaining = 1800;
      }
   }

   private class BMListener implements ActionListener{
      public void actionPerformed(ActionEvent e){
         int i = 0;
         if(balloonLinkedList.size() > 0){
            i = 1;
         }
         for(int d = 0; d < i; d++){
            /*if(!balloonLinkedList.get(d).getActive()){
               balloonLinkedList.poll();
               threadLinkedList.poll();
            }*/
            if(balloonLinkedList.get(d).getPopped()){
               balloonLinkedList.poll();
               threadLinkedList.poll();
            }
         }
         int x = 200;
         do{
            x = (int)(Math.random() * (rBound - DIAMETER));
         }
         while(Math.abs(x - (rBound / 2)) < (bBound / 7));
         Balloon b = new Balloon(x, 400, myBuffer);
         balloonLinkedList.push(b);
         Thread thread = new Thread(b);
         threadLinkedList.push(thread);
         thread.start();
      }
   }
   public LinkedList<Balloon> getBalloonLinkedList(){
      return balloonLinkedList;
   }
}
class Aimer{
   private final int RADIUS = 7;
   private int myX, myY;
   private Graphics2D myBuffer;
   public Aimer(Graphics2D g2D){
      myX = 0; myY = 0;
      this.myBuffer = g2D;
   }
   public void drawMe(int x, int y){
      myX = x;
      myY = y;
      myBuffer.setColor(Color.RED);
      myBuffer.fillOval(x - RADIUS, y - RADIUS, RADIUS * 2, RADIUS * 2);
      myBuffer.setStroke(new BasicStroke(2));
      myBuffer.setColor(Color.BLACK);
      myBuffer.drawLine(x, y - RADIUS, x, y + RADIUS);
      myBuffer.drawLine(x - RADIUS, y, x + RADIUS, y);
      myBuffer.setStroke(new BasicStroke(8));
   }
   public int getX(){
      return myX;
   }
   public int getY(){
      return myY;
   }
   public void clear(int x, int y){
      myBuffer.setColor(Color.WHITE);
      myBuffer.drawLine(x, y - RADIUS, x, y + RADIUS);
      myBuffer.drawLine(x - RADIUS, y, x + RADIUS, y);
      myBuffer.fillOval(x - RADIUS - 1, y - RADIUS - 1, RADIUS * 2 + 1, RADIUS * 2 + 1);
   }
}
class Leaderboard extends JFrame{
   private JLabel name = new JLabel("Enter name"), scoreHeader = new JLabel("Score"), nameHeader = new JLabel("Name");
   private JTextField nameTF = new JTextField(20);
   private JTextField[] tfArray = new JTextField[20];
   private TreeMap<Integer, String> scores;
   private JPanel panel = new JPanel(new GridLayout(11, 2));
   private ObjectInputStream in;
   private  ObjectOutputStream out;
   public Leaderboard(){
      setSize(600, 400);
      setLayout(new BorderLayout());
      setTitle("Leaderboard");
      setLocationRelativeTo(null);
      panel.add(nameHeader);
      panel.add(scoreHeader);
      for(int i = 0; i < tfArray.length; i++){
         tfArray[i] = new JTextField(20);
         panel.add(tfArray[i]);
      }
      add(panel);
      try{
         in = new ObjectInputStream(new BufferedInputStream(new FileInputStream(new File("scores.dat"))));
         scores = (TreeMap<Integer, String>)in.readObject();
      }
      catch(FileNotFoundException fnf){
         scores = new TreeMap<Integer, String>();
      }
      catch(Exception io){
         System.out.println("IOException or cnf");
      }
   }
}