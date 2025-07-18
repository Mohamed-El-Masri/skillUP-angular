import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

import { AiService } from '../services/ai.service';
import { AIMessage, ChatRequest, SkillAnalysisRequest, CareerRecommendationRequest } from '../models/interfaces';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  template: `
    <div class="ai-chat-container">
      <!-- Header Section -->
      <div class="chat-header">
        <div class="header-content">
          <div class="ai-avatar">
            <mat-icon>psychology</mat-icon>
          </div>
          <div class="header-text">
            <h1>AI Career Assistant</h1>
            <p>Get personalized guidance for your professional development journey</p>
          </div>
          <div class="chat-stats">
            <div class="stat">
              <span class="number">{{messages.length}}</span>
              <label>Messages</label>
            </div>
            <div class="stat">
              <span class="number">{{analysisCount}}</span>
              <label>Analyses</label>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-tabs">
        <mat-tab-group mat-align-tabs="center" class="modern-tabs">
          <!-- Chat Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>chat</mat-icon>
              <span>Chat Assistant</span>
            </ng-template>
            
            <div class="chat-content">
              <div class="messages-container" #messagesContainer>
                <!-- Welcome message -->
                <div class="message ai-message welcome-message" *ngIf="messages.length === 0">
                  <div class="message-content">
                    <div class="message-avatar">
                      <mat-icon>psychology</mat-icon>
                    </div>
                    <div class="message-text">
                      <div class="message-body">
                        <h3>👋 Welcome to your AI Career Assistant!</h3>
                        <p>I'm here to help you with:</p>
                        <ul>
                          <li>Career guidance and planning</li>
                          <li>Skill development recommendations</li>
                          <li>Interview preparation tips</li>
                          <li>Resume and CV optimization</li>
                          <li>Learning path suggestions</li>
                        </ul>
                        <p>What would you like to discuss today?</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Chat messages -->
                <div *ngFor="let message of messages; let i = index" 
                     class="message" 
                     [class.user-message]="message.isFromUser"
                     [class.ai-message]="!message.isFromUser">
                  <div class="message-content">
                    <div class="message-avatar">
                      <mat-icon>{{ message.isFromUser ? 'person' : 'psychology' }}</mat-icon>
                    </div>
                    <div class="message-text">
                      <div class="message-body" [innerHTML]="formatMessage(message.content)"></div>
                      <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                      <div class="message-actions" *ngIf="!message.isFromUser">
                        <button mat-icon-button (click)="copyMessage(message.content)" title="Copy message">
                          <mat-icon>content_copy</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Typing indicator -->
                <div *ngIf="isTyping" class="message ai-message typing-message">
                  <div class="message-content">
                    <div class="message-avatar">
                      <mat-icon>psychology</mat-icon>
                    </div>
                    <div class="message-text">
                      <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <div class="typing-text">AI is thinking...</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick suggestions -->
              <div class="quick-suggestions" *ngIf="messages.length === 0">
                <h3>💡 Quick Start Questions</h3>
                <div class="suggestions-grid">
                  <button mat-stroked-button 
                          *ngFor="let suggestion of quickSuggestions" 
                          (click)="sendQuickMessage(suggestion)"
                          class="suggestion-chip">
                    <mat-icon>{{suggestion.icon}}</mat-icon>
                    <span>{{suggestion.text}}</span>
                  </button>
                </div>
              </div>

              <!-- Chat input -->
              <div class="chat-input-container">
                <form [formGroup]="chatForm" (ngSubmit)="sendMessage()" class="chat-form">
                  <div class="input-wrapper">
                    <mat-form-field appearance="outline" class="chat-input">
                      <mat-label>Type your message here...</mat-label>
                      <input matInput formControlName="message" 
                             (keydown.enter)="sendMessage()"
                             [disabled]="isLoading"
                             placeholder="Ask me anything about your career...">
                      <mat-hint>Press Enter to send</mat-hint>
                    </mat-form-field>
                    <div class="input-actions">
                      <button mat-mini-fab color="primary" type="submit" 
                              [disabled]="chatForm.invalid || isLoading"
                              class="send-btn">
                        <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                        <mat-icon *ngIf="!isLoading">send</mat-icon>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </mat-tab>

          <!-- Skill Analysis Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>analytics</mat-icon>
              <span>Skill Analysis</span>
            </ng-template>
            
            <div class="analysis-content">
              <div class="analysis-card">
                <div class="card-header">
                  <mat-icon>analytics</mat-icon>
                  <div class="header-text">
                    <h2>Skill Gap Analysis</h2>
                    <p>Discover which skills to develop for your career goals</p>
                  </div>
                </div>
                
                <form [formGroup]="skillAnalysisForm" (ngSubmit)="performSkillAnalysis()" class="analysis-form">
                  <div class="form-section">
                    <h3>Current Role & Experience</h3>
                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Current Job Title</mat-label>
                        <input matInput formControlName="currentRole" placeholder="e.g. Software Developer">
                        <mat-icon matSuffix>work</mat-icon>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Years of Experience</mat-label>
                        <input matInput type="number" formControlName="experience" placeholder="e.g. 3">
                        <mat-icon matSuffix>schedule</mat-icon>
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="form-section">
                    <h3>Target Role</h3>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Desired Position</mat-label>
                      <input matInput formControlName="targetRole" placeholder="e.g. Senior Full Stack Developer">
                      <mat-icon matSuffix>flag</mat-icon>
                    </mat-form-field>
                  </div>

                  <div class="form-section">
                    <h3>Current Skills</h3>
                    <div class="skills-input">
                      <mat-form-field appearance="outline">
                        <mat-label>Add a skill</mat-label>
                        <input matInput #skillInput (keyup.enter)="addSkill(skillInput.value); skillInput.value = ''" placeholder="e.g. JavaScript, Python">
                        <mat-icon matSuffix>psychology</mat-icon>
                      </mat-form-field>
                      <button mat-icon-button type="button" (click)="addSkill(skillInput.value); skillInput.value = ''">
                        <mat-icon>add</mat-icon>
                      </button>
                    </div>
                    
                    <div class="current-skills" *ngIf="currentSkills.length > 0">
                      <div class="skills-list">
                        <div *ngFor="let skill of currentSkills; let i = index" 
                             class="skill-chip"
                             (click)="removeSkill(i)">
                          <span>{{skill}}</span>
                          <mat-icon>close</mat-icon>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="skillAnalysisForm.invalid || isAnalyzing"
                            class="analyze-btn">
                      <mat-spinner diameter="20" *ngIf="isAnalyzing"></mat-spinner>
                      <mat-icon *ngIf="!isAnalyzing">analytics</mat-icon>
                      <span>{{isAnalyzing ? 'Analyzing...' : 'Analyze Skills'}}</span>
                    </button>
                  </div>
                </form>

                <!-- Analysis Results -->
                <div class="analysis-results" *ngIf="analysisResults">
                  <div class="results-header">
                    <h3>📊 Analysis Results</h3>
                    <p>Based on your current skills and target role</p>
                  </div>
                  
                  <div class="results-content">
                    <div class="skill-match-score">
                      <div class="score-circle">
                        <div class="score-text">
                          <span class="percentage">{{analysisResults.matchPercentage}}%</span>
                          <label>Match</label>
                        </div>
                      </div>
                      <p>Your current skills match {{analysisResults.matchPercentage}}% of the requirements for your target role.</p>
                    </div>

                    <div class="recommendations-section">
                      <h4>🎯 Recommended Skills to Learn</h4>
                      <div class="recommendations-grid">
                        <div *ngFor="let skill of analysisResults.recommendedSkills" class="recommendation-card">
                          <div class="skill-info">
                            <h5>{{skill.name}}</h5>
                            <p>{{skill.description}}</p>
                          </div>
                          <div class="skill-priority">
                            <span class="priority-badge" [class]="skill.priority">{{skill.priority}}</span>
                            <span class="learning-time">{{skill.estimatedLearningTime}}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="learning-path">
                      <h4>🛤️ Suggested Learning Path</h4>
                      <div class="path-timeline">
                        <div *ngFor="let step of analysisResults.learningPath; let i = index" class="timeline-item">
                          <div class="timeline-marker">{{i + 1}}</div>
                          <div class="timeline-content">
                            <h5>{{step.title}}</h5>
                            <p>{{step.description}}</p>
                            <span class="duration">{{step.duration}}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Career Recommendations Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>trending_up</mat-icon>
              <span>Career Paths</span>
            </ng-template>
            
            <div class="career-content">
              <div class="career-card">
                <div class="card-header">
                  <mat-icon>trending_up</mat-icon>
                  <div class="header-text">
                    <h2>Career Path Recommendations</h2>
                    <p>Explore potential career trajectories based on your skills and interests</p>
                  </div>
                </div>
                
                <form [formGroup]="careerForm" (ngSubmit)="getCareerRecommendations()" class="career-form">
                  <div class="form-section">
                    <h3>Career Interests</h3>
                    <div class="interests-grid">
                      <div *ngFor="let interest of careerInterests" class="interest-chip" 
                           [class.selected]="interest.selected"
                           (click)="toggleInterest(interest)">
                        <mat-icon>{{interest.icon}}</mat-icon>
                        <span>{{interest.name}}</span>
                      </div>
                    </div>
                  </div>

                  <div class="form-section">
                    <h3>Work Preferences</h3>
                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Preferred Work Environment</mat-label>
                        <mat-select formControlName="workEnvironment">
                          <mat-option value="remote">Remote</mat-option>
                          <mat-option value="hybrid">Hybrid</mat-option>
                          <mat-option value="office">Office</mat-option>
                          <mat-option value="flexible">Flexible</mat-option>
                        </mat-select>
                        <mat-icon matSuffix>business</mat-icon>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Career Stage</mat-label>
                        <mat-select formControlName="careerStage">
                          <mat-option value="entry">Entry Level</mat-option>
                          <mat-option value="mid">Mid Level</mat-option>
                          <mat-option value="senior">Senior Level</mat-option>
                          <mat-option value="lead">Leadership</mat-option>
                        </mat-select>
                        <mat-icon matSuffix>timeline</mat-icon>
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="careerForm.invalid || isGettingRecommendations"
                            class="recommend-btn">
                      <mat-spinner diameter="20" *ngIf="isGettingRecommendations"></mat-spinner>
                      <mat-icon *ngIf="!isGettingRecommendations">explore</mat-icon>
                      <span>{{isGettingRecommendations ? 'Analyzing...' : 'Get Recommendations'}}</span>
                    </button>
                  </div>
                </form>

                <!-- Career Recommendations Results -->
                <div class="career-results" *ngIf="careerRecommendations && careerRecommendations.length > 0">
                  <div class="results-header">
                    <h3>🚀 Recommended Career Paths</h3>
                    <p>Based on your interests and preferences</p>
                  </div>
                  
                  <div class="career-paths">
                    <div *ngFor="let path of careerRecommendations" class="career-path-card">
                      <div class="path-header">
                        <div class="path-icon">
                          <mat-icon>{{path.icon}}</mat-icon>
                        </div>
                        <div class="path-info">
                          <h4>{{path.title}}</h4>
                          <p>{{path.description}}</p>
                        </div>
                        <div class="path-match">
                          <span class="match-score">{{path.matchScore}}%</span>
                          <label>Match</label>
                        </div>
                      </div>
                      
                      <div class="path-details">
                        <div class="detail-item">
                          <mat-icon>attach_money</mat-icon>
                          <span>{{path.salaryRange}}</span>
                        </div>
                        <div class="detail-item">
                          <mat-icon>trending_up</mat-icon>
                          <span>{{path.growthPotential}}</span>
                        </div>
                        <div class="detail-item">
                          <mat-icon>schedule</mat-icon>
                          <span>{{path.timeToTransition}}</span>
                        </div>
                      </div>
                      
                      <div class="required-skills">
                        <h5>Required Skills:</h5>
                        <div class="skills-tags">
                          <span *ngFor="let skill of path.requiredSkills" class="skill-tag">{{skill}}</span>
                        </div>
                      </div>
                      
                      <div class="path-actions">
                        <button mat-stroked-button color="primary" (click)="exploreCareerPath(path)">
                          <mat-icon>explore</mat-icon>
                          Explore Path
                        </button>
                        <button mat-stroked-button (click)="saveCareerPath(path)">
                          <mat-icon>bookmark</mat-icon>
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styleUrls: ['./ai-chat.component.scss']
})
export class AiChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  chatForm: FormGroup;
  skillAnalysisForm: FormGroup;
  careerForm: FormGroup;
  
  messages: AIMessage[] = [];
  isLoading = false;
  isTyping = false;
  isAnalyzing = false;
  isGettingRecommendations = false;
  analysisCount = 0;
  
  currentSkills: string[] = [];
  analysisResults: any = null;
  careerRecommendations: any[] = [];
  
  quickSuggestions = [
    { text: 'How can I improve my programming skills?', icon: 'code' },
    { text: 'What are the best career paths in technology?', icon: 'trending_up' },
    { text: 'How should I prepare for job interviews?', icon: 'psychology' },
    { text: 'Tips for writing an outstanding resume', icon: 'description' }
  ];

  careerInterests = [
    { name: 'Software Development', icon: 'code', selected: false },
    { name: 'Data Science', icon: 'analytics', selected: false },
    { name: 'UI/UX Design', icon: 'design_services', selected: false },
    { name: 'Project Management', icon: 'business', selected: false },
    { name: 'DevOps', icon: 'cloud', selected: false },
    { name: 'Cybersecurity', icon: 'security', selected: false }
  ];

  constructor(
    private fb: FormBuilder,
    private aiService: AiService,
    private snackBar: MatSnackBar
  ) {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required]]
    });
    
    this.skillAnalysisForm = this.fb.group({
      currentRole: ['', [Validators.required]],
      experience: [0, [Validators.required, Validators.min(0)]],
      targetRole: ['', [Validators.required]]
    });
    
    this.careerForm = this.fb.group({
      workEnvironment: ['', [Validators.required]],
      careerStage: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Welcome message is handled in the template
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {}
  }

  sendMessage() {
    if (this.chatForm.valid && !this.isLoading) {
      const message = this.chatForm.value.message.trim();
      if (!message) return;

      // Add user message
      this.messages.push({
        id: this.messages.length + 1,
        conversationId: 1,
        content: message,
        isFromUser: true,
        timestamp: new Date()
      });

      this.chatForm.reset();
      this.isLoading = true;
      this.isTyping = true;

      const request: ChatRequest = { message };

      this.aiService.chatWithAssistant(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isTyping = false;
          
          this.messages.push({
            id: this.messages.length + 1,
            conversationId: 1,
            content: response.response,
            isFromUser: false,
            timestamp: new Date()
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.isTyping = false;
          
          this.messages.push({
            id: this.messages.length + 1,
            conversationId: 1,
            content: 'Sorry, there was a connection error. Please try again.',
            isFromUser: false,
            timestamp: new Date()
          });
          
          this.snackBar.open('Connection error with service', 'Close', { duration: 3000 });
        }
      });
    }
  }

  sendQuickMessage(suggestion: any) {
    this.chatForm.patchValue({ message: suggestion.text });
    this.sendMessage();
  }

  performSkillAnalysis() {
    if (this.skillAnalysisForm.valid && !this.isAnalyzing) {
      const formValue = this.skillAnalysisForm.value;
      
      const request: SkillAnalysisRequest = {
        skills: this.currentSkills,
        assessmentResults: []
      };

      this.isAnalyzing = true;
      this.analysisCount++;

      this.aiService.analyzeSkills(request).subscribe({
        next: (response) => {
          this.isAnalyzing = false;
          this.analysisResults = response;
        },
        error: (error) => {
          this.isAnalyzing = false;
          this.snackBar.open('Error analyzing skills', 'Close', { duration: 3000 });
        }
      });
    }
  }

  addSkill(skill: string) {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !this.currentSkills.includes(trimmedSkill)) {
      this.currentSkills.push(trimmedSkill);
    }
  }

  removeSkill(index: number) {
    this.currentSkills.splice(index, 1);
  }

  toggleInterest(interest: any) {
    interest.selected = !interest.selected;
  }

  getCareerRecommendations() {
    if (this.careerForm.valid && !this.isGettingRecommendations) {
      const selectedInterests = this.careerInterests
        .filter(interest => interest.selected)
        .map(interest => interest.name);
      
      const request: CareerRecommendationRequest = {
        skills: this.currentSkills,
        interests: selectedInterests,
        educationLevel: 'Bachelor',
        experience: '3'
      };

      this.isGettingRecommendations = true;

      this.aiService.recommendCareers(request).subscribe({
        next: (response) => {
          this.isGettingRecommendations = false;
          this.careerRecommendations = response;
        },
        error: (error) => {
          this.isGettingRecommendations = false;
          this.snackBar.open('Error getting career recommendations', 'Close', { duration: 3000 });
        }
      });
    }
  }

  exploreCareerPath(path: any) {
    this.snackBar.open(`Exploring ${path.title} career path...`, 'Close', { duration: 3000 });
  }

  saveCareerPath(path: any) {
    this.snackBar.open(`${path.title} saved to your profile!`, 'Close', { duration: 3000 });
  }

  copyMessage(content: string) {
    navigator.clipboard.writeText(content);
    this.snackBar.open('Message copied to clipboard', 'Close', { duration: 2000 });
  }

  formatMessage(content: string): string {
    // Basic formatting for AI responses
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
